---
title: "O que o Claude Code ensina sobre trabalhar com IA"
date: 2026-05-24
type: article
tags: [ia, claude, typescript, engenharia de software, llm, contexto, agentes]
description: "Chamar uma API de LLM é uma coisa, integrar um modelo com sua aplicação igual o Claude Code faz, é outro nível."
cover: /blog/_content/o-que-o-claude-code-ensina-sobre-ia/cover.jpg
coverAlt: "Código TypeScript do Claude Code mostrando gerenciamento de contexto e loop de agente"
ogTitle: "O que o Claude Code ensina sobre trabalhar com IA"
draft: false
---

Chamar uma API de LLM é fácil. Qualquer tutorial de quinze minutos chega lá.

Construir um produto que funciona de verdade com LLM é outra coisa. A diferença está em decisões que nunca aparecem nos tutoriais: como gerenciar contexto sem estourar a janela, como executar ferramentas com segurança, como recuperar de erros sem entrar em loop infinito, como rastrear custo sem surpresas na fatura.

O Claude Code, o CLI oficial da Anthropic, não tem o código-fonte disponível oficialmente. O que aconteceu foi um erro de build: uma versão foi publicada no npm com os source maps incluídos, expondo o código TypeScript original antes da minificação. A Anthropic foi atrás, derrubou repositórios, abriu takedowns, mas o código já tinha espalhado o suficiente para não sumir. No fim, perderam a batalha. O [vazamento foi confirmado pela própria Anthropic](https://www.tecmundo.com.br/seguranca/412058-anthropic-confirma-vazamento-do-codigo-fonte-do-claude-code.htm).

O que me interessa aqui não é o aspecto do vazamento em si, mas o que está dentro. Passei um tempo lendo esse código, disponível em [github.com/codeaashu/claude-code](https://github.com/codeaashu/claude-code), e o que encontrei foi um conjunto de decisões de engenharia que mostram como um produto de IA de verdade resolve problemas que os tutoriais ignoram.

O tema central de tudo que vou mostrar é o mesmo: **contexto é o recurso mais escasso de qualquer aplicação com LLM, e o Claude Code trata isso com um rigor que vale estudar**.

---

## Modele a conversa como stream, não como request/response

O instinto natural ao integrar um LLM é tratar como uma chamada de API comum: manda prompt, espera resposta, processa. Funciona para casos simples. Não funciona para um produto.

O método central do Claude Code emite mensagens incrementalmente enquanto o modelo ainda está processando:

```typescript
// src/QueryEngine.ts
async *submitMessage(
  prompt: string | ContentBlockParam[],
  options?: { uuid?: string; isMeta?: boolean },
): AsyncGenerator<SDKMessage, void, unknown>
```

Em vez de retornar uma resposta, o método *emite* eventos. A interface mostra tokens chegando em tempo real. O estado da conversa, histórico, arquivos lidos, uso de tokens, é mantido entre turnos, mas isolado entre sessões diferentes.

Desde o início, modele a interação com o LLM como um stream de eventos, não como uma transação. A diferença de experiência para o usuário é enorme, e refatorar depois é caro.

---

## Contexto desnecessário consome muito token

Um dos erros mais comuns ao construir com LLMs é encher o prompt com informação "só por garantia". Cada token custa dinheiro e consome janela de contexto, que é finita.

O Claude Code resolve isso com injeção lazy e memoizada:

```typescript
// src/context.ts
export const getSystemContext = memoize(
  async (): Promise<{ [k: string]: string }> => {
    const gitStatus =
      isEnvTruthy(process.env.CLAUDE_CODE_REMOTE) ||
      !shouldIncludeGitInstructions()
        ? null
        : await getGitStatus()

    return {
      ...(gitStatus && { gitStatus }),
    }
  },
)
```

O `git status` só é computado se o ambiente for relevante. É memoizado para não rodar duas vezes. E só é injetado no prompt se for não-nulo. Contexto vazio não vira mensagem.

Três regras simples: compute sob demanda, cacheeie o resultado, e só envie o que for não-vazio e relevante. O custo de não fazer isso aparece na fatura e na qualidade das respostas.

---

## `git diff` é muito caro, ele trata isso antes

Quando o Claude Code precisa passar o estado do repositório para o modelo, ele não executa `git diff` direto. Primeiro faz uma sonda:

```typescript
// src/utils/gitDiff.ts
const { stdout: shortstatOut } = await execFileNoThrow(
  gitExe(),
  ['--no-optional-locks', 'diff', 'HEAD', '--shortstat'],
  { timeout: GIT_TIMEOUT_MS },
)

const quickStats = parseShortstat(shortstatOut)

if (quickStats && quickStats.filesCount > MAX_FILES_FOR_DETAILS) {
  return {
    stats: quickStats,
    perFileStats: new Map(),
    hunks: new Map(), // vazio intencionalmente
  }
}
```

`--shortstat` não carrega conteúdo, só conta arquivos. É O(1) em memória. Se o repositório tiver mudanças em mais de 500 arquivos, retorna só as estatísticas, sem tentar carregar centenas de megabytes no contexto.

Antes de passar código ou output para o contexto de um LLM, meça o tamanho do problema. Uma sonda barata pode evitar um estouro de contexto.

---

## Quando o contexto fica cheio, ele entra em estado de compactação

Esse é o ponto onde o Claude Code mais me impressionou.

Janela de contexto cheia é um dos problemas mais comuns em aplicações de IA de longa duração. A resposta ingênua é travar ou mostrar um erro genérico. O Claude Code usa múltiplos buffers aninhados com propósitos distintos:

```typescript
// src/services/compact/autoCompact.ts
export const AUTOCOMPACT_BUFFER_TOKENS = 13_000       // dispara compactação automática
export const WARNING_THRESHOLD_BUFFER_TOKENS = 20_000 // avisa o usuário antes
export const MANUAL_COMPACT_BUFFER_TOKENS = 3_000     // margem para compactação manual
```

Tem três níveis de resposta antes de qualquer falha: aviso antecipado para o usuário, compactação automática, e margem de segurança para compactação manual. Além dos buffers, há um circuit breaker: se a compactação automática falhar três vezes consecutivas, para de tentar. Isso evita loop infinito quando o contexto está irrecuperavelmente cheio.

A compactação não é simplesmente jogar mensagens fora. O Claude Code pede ao próprio modelo que resuma a conversa em andamento, preservando o contexto relevante em menos tokens, e continua de onde parou.

Contexto cheio é um estado esperado, não excepcional. Planeje camadas de resposta e sempre coloque um circuit breaker para não entrar em loop em condições de erro.

---

## Ferramentas paralelas pode virar race condition

Quando o modelo pede múltiplas ferramentas ao mesmo tempo, ler três arquivos por exemplo, a execução sequencial é um desperdício. Mas execução paralela sem cuidado cria race conditions.

O Claude Code resolve com particionamento por segurança de concorrência:

```typescript
// src/services/tools/toolOrchestration.ts
for (const { isConcurrencySafe, blocks } of partitionToolCalls(toolUseMessages)) {
  if (isConcurrencySafe) {
    // ferramentas read-only rodam em paralelo
    for await (const update of runToolsConcurrently(blocks, ...)) {
      if (update.contextModifier) {
        queuedContextModifiers[update.toolUseID].push(update.contextModifier)
      }
      yield { message: update.message }
    }
    // modificações de contexto aplicadas atomicamente após o batch
    for (const block of blocks) {
      for (const modifier of queuedContextModifiers[block.id]) {
        currentContext = modifier(currentContext)
      }
    }
  } else {
    // ferramentas com efeitos colaterais rodam sequencialmente
    for await (const update of runToolsSerially(blocks, ...)) {
      yield update
    }
  }
}
```

Cada ferramenta declara `isConcurrencySafe` baseado no input real, não globalmente. Um `BashTool` pode ser concorrente se o comando for só leitura. Modificações de contexto são enfileiradas e aplicadas depois que o batch paralelo termina, de forma atômica.

---

## Segurança na hora de chamar a tool call

Quando você dá acesso a comandos shell para um agente de IA, o espaço de risco é diferente. Um humano tem julgamento contextual. O modelo não.

O BashTool do Claude Code passa por três camadas de validação antes de qualquer coisa chegar ao sistema operacional.

A primeira é um parser AST real, usando tree-sitter-bash. O design é fail-closed: qualquer tipo de nó não reconhecido resulta em rejeição. Não tenta ser permissivo com o que não entende.

A segunda é um allowlist explícito de comandos com suas flags permitidas. Com restrições específicas por comando: `date` bloqueia `-s` (que mudaria o horário do sistema), `tree` bloqueia `-o` (escrita em arquivo), `ps` bloqueia o modificador que expõe variáveis de ambiente.

A terceira interpreta semântica de exit codes:

```typescript
// src/tools/BashTool/commandSemantics.ts
// grep/rg:  exit 1 = nenhum resultado (não é erro), 2+ = erro real
// diff:     exit 1 = arquivos diferentes (não é erro), 2+ = erro
// find:     exit 1 = sucesso parcial, 2+ = erro
```

Sem isso, o modelo interpretaria "grep não encontrou nada" como falha do comando e potencialmente tentaria recuperar de um não-erro, tomando ações desnecessárias.

---

## Nomeie as transições do seu loop de agente

O loop principal de um agente parece simples: chama o modelo, executa ferramentas, repete. Na prática, há várias razões distintas para continuar ou parar, e confundi-las gera bugs difíceis de rastrear.

O Claude Code usa uma máquina de estados com transições nomeadas:

```typescript
// src/query.ts
type State = {
  messages: Message[]
  maxOutputTokensRecoveryCount: number
  hasAttemptedReactiveCompact: boolean
  transition: Continue | undefined
}

// Transições explícitas:
// - 'next_turn':                  conclusão normal
// - 'max_output_tokens_recovery': retry após atingir limite de tokens
// - 'max_output_tokens_escalate': escala de 8k para 64k tokens de output
// - 'reactive_compact_retry':     compactação reativa recuperou de prompt-too-long
// - 'collapse_drain_retry':       colapso de contexto drenou collapses enfileirados
```

A ordem de recuperação é deliberada: primeiro tenta colapso (barato), depois compactação reativa (cara), depois escalada de tokens. "Continuar porque o modelo pediu mais ferramentas" é diferente de "continuar porque estamos recuperando de context overflow". Nomear essas transições torna o comportamento testável e o debugging possível.

---

## Trate custo de API como métrica de produto

Custo de API costuma aparecer nas conversas só quando a fatura chega. No Claude Code, é cidadão de primeira classe desde o início:

```typescript
// src/cost-tracker.ts
export function saveCurrentSessionCosts(): void {
  saveCurrentProjectConfig(current => ({
    ...current,
    lastCost: getTotalCostUSD(),
    lastAPIDuration: getTotalAPIDuration(),
    lastTotalInputTokens: getTotalInputTokens(),
    lastTotalOutputTokens: getTotalOutputTokens(),
    lastTotalCacheReadInputTokens: getTotalCacheReadInputTokens(),
    lastModelUsage: Object.fromEntries(
      Object.entries(getModelUsage()).map(([model, usage]) => [
        model,
        { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, costUSD: usage.costUSD },
      ]),
    ),
    lastSessionId: getSessionId(),
  }))
}
```

O custo é rastreado por modelo: se a sessão usou Sonnet para algumas mensagens e Opus para outras, o breakdown é preservado. O estado sobrevive a reinicializações. A restauração verifica o `lastSessionId` para não somar custo de sessões diferentes.

Custo de API não é só financeiro, é proxy para complexidade da tarefa e eficiência do prompt. Rastreie por modelo, por sessão, desde o começo.

---

## Resumindo...

Olhando tudo junto, os problemas não são novos. Só os constraints são diferentes.

Gerenciar janela de contexto é gerenciamento de memória. Validação de ferramentas é sanitização de input. Máquina de estados com recuperação é tratamento de erro. Rastreamento de custo é observabilidade.

Isso tem nome: **harness engineering**. É a disciplina de construir tudo que fica ao redor do modelo: o loop de agente, o gerenciamento de contexto, a orquestração de ferramentas, a recuperação de falha. Não é o modelo que faz o produto funcionar. É o harness.

Com LLMs, esses problemas têm menos margem para improviso: o contexto é finito e caro, os erros de validação têm consequências maiores, e os loops infinitos acontecem de formas que você não prevê.

O que o Claude Code mostra é que harness engineering exige os mesmos fundamentos de sempre, aplicados com mais rigor. E que o problema do contexto, especificamente, merece ser tratado como um sistema completo, com prevenção, recuperação e circuit breakers, não como um edge case que aparece só quando a fatura chega.

---

*Repositório: [github.com/codeaashu/claude-code](https://github.com/codeaashu/claude-code)*

*Arquivos para explorar no código-fonte:*

- `src/QueryEngine.ts`: orquestrador principal
- `src/query.ts`: loop da máquina de estados
- `src/context.ts`: montagem de contexto
- `src/utils/gitDiff.ts`: estratégia de diff
- `src/services/compact/autoCompact.ts`: compactação automática
- `src/services/tools/toolOrchestration.ts`: execução paralela de ferramentas
- `src/cost-tracker.ts`: rastreamento de custo
