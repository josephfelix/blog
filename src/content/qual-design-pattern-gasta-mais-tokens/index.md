---
title: "Como a organização do código influencia o consumo de tokens?"
date: 2026-06-07
type: article
tags: [ia, llm, tokens, design patterns, arquitetura, node.js, benchmark, openrouter, claude code]
description: "Montei 5 projetos Node.js com diferentes formas de organização do código e mandei o mesmo prompt em cada um. O objetivo era medir como a estrutura do projeto influencia o consumo de tokens numa tarefa real."
cover: /blog/_content/qual-design-pattern-gasta-mais-tokens/cover.png
coverAlt: "Balança com diferentes formas de organização de código de um lado e tokens do outro, representando o custo de cada estrutura"
draft: false
---

Comecei a me perguntar se a arquitetura do código influencia o consumo de tokens de um LLM. A hipótese parece óbvia à primeira vista: um projeto com mais arquivos, mais abstrações e mais indireção provavelmente exige que o modelo leia mais contexto para entender onde fazer uma mudança. Mas eu queria medir isso de verdade.

Montei um experimento com cinco projetos Node.js. Todos implementam a mesma coisa: um cadastro de usuários. A diferença está na forma de organizar o código em cada um.

---

## Os cinco projetos

| Projeto | Padrão |
|---------|--------|
| project-a | Monolítico, tudo em um único arquivo, sem separação de responsabilidades |
| project-b | MVC, separação em Models, Controllers e Routes |
| project-c | Strategy + Repository, estratégias de validação plugáveis e repositório para abstração de dados |
| project-d | Clean Architecture (Hexagonal), camadas de domínio, aplicação e infraestrutura com inversão de dependência |
| project-e | Observer/Event-Driven, event bus desacopla rotas da lógica de negócio via eventos |

Para cada projeto, mandei exatamente o mesmo prompt, sem nenhuma variação:

```
Esta pasta contém um projeto Node.js já implementado.
Sua tarefa é implementar a seguinte funcionalidade:
    Adicionar campo CPF ao cadastro de usuários.
Regras:
 - CPF obrigatório
 - CPF único
 - CPF retornado pela API
 - CPF persistido
```

A tarefa é simples e bem delimitada. O modelo precisa encontrar onde os dados são definidos, onde a validação acontece, onde a persistência ocorre e onde a resposta é montada. Em um projeto monolítico isso é trivial. Em um projeto com Clean Architecture, são quatro camadas distintas.

---

## Primeira rodada: modelos locais com Ollama

O primeiro benchmark rodou local. Subi um container com Ollama e testei três modelos pequenos, todos a 8,5 t/s:

- `qwen3:4b`
- `llama3.2:3b`
- `gemma3:4b`

A ideia era ter uma linha de base barata, sem depender de API externa, para ver se o padrão de consumo apareceria mesmo com modelos menores.

Curiosamente, o projeto A, que não tem nenhum design pattern, acabou sendo o maior consumidor de tokens. A explicação é contra-intuitiva: sem um padrão definindo onde cada responsabilidade fica, o modelo precisou gerar mais output para resolver a ambiguidade, onde fica a validação, onde fica a persistência, onde a resposta é montada. Em projetos com arquitetura clara, o próprio padrão responde essas perguntas antes de qualquer linha ser escrita. No projeto A, o modelo teve que resolver isso durante a geração, e esse trabalho extra aparece direto na contagem de tokens.

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_tokens_local.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_tokens_local.png" alt="Média de tokens gastos por projeto nos modelos locais com Ollama" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Média de tokens gastos por projeto nos três modelos locais</figcaption>
</figure>

O gráfico acima agrega a média dos três modelos. Mas olhando os dados separados por modelo, aparece um detalhe que muda a leitura do experimento inteiro: o modelo importa tanto quanto a organização do projeto.

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/tokens_por_projetos_modelos.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/tokens_por_projetos_modelos.png" alt="Consumo de tokens por projeto separado por modelo" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Consumo de tokens por projeto, separado por modelo</figcaption>
</figure>

O `llama3.2:3b` consome significativamente mais tokens para processar a mesma tarefa nos mesmos projetos que o `qwen3:4b` e o `gemma3:4b`. Isso significa que parte do que parece ser "custo da organização do código" é, na prática, custo do modelo. Um projeto com Clean Architecture processado pelo llama pode gastar mais tokens do que o mesmo projeto monolítico processado pelo qwen3, não porque a arquitetura exige mais, mas porque o modelo é menos eficiente em navegar o código.

Isso não invalida a comparação entre projetos, mas é um fator que precisa estar na conta. Antes de concluir que determinado padrão é caro, vale saber qual modelo está fazendo a leitura.

---

## Segunda rodada: modelos maiores via OpenRouter

Os resultados locais levantaram mais perguntas do que respostas. Queria ver se modelos mais capazes fariam escolhas diferentes de navegação no código, o que mudaria o consumo de tokens de uma forma mais significativa.

Refiz o benchmark usando a OpenRouter com três modelos:

- `deepseek/deepseek-chat-v3-0324`
- `qwen/qwen3-235b-a22b`
- `anthropic/claude-3.5-sonnet`

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_tokens_openrouter.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_tokens_openrouter.png" alt="Média de tokens gastos por projeto nos modelos via OpenRouter" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Média de tokens gastos por projeto nos três modelos via OpenRouter</figcaption>
</figure>

O resultado aqui é o oposto da primeira rodada. O projeto A, que nos modelos locais liderou o consumo, ficou entre os mais baratos em tokens. Os que mais consumiram foram o E e o B, o que por si só é um dado interessante: não foram os padrões mais complexos na hierarquia de abstração que geraram mais custo, mas sim o Observer/Event-Driven e o MVC. O experimento não permite concluir o porquê com precisão, mas o dado está lá. Modelos mais eficientes resolvem a ambiguidade do código simples com muito menos esforço, e o custo que aparece passa a depender de como cada padrão específico organiza o código para leitura.

Tokens não são a história completa. Modelos diferentes cobram preços diferentes por token, então um modelo que consome menos tokens pode custar mais do que um que consome mais, dependendo da tabela de preços. O gráfico abaixo mostra o custo médio por operação em cada projeto.

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_custo_openrouter.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/media_custo_openrouter.png" alt="Média de custo por operação em cada projeto via OpenRouter" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Média de custo por operação em cada projeto via OpenRouter</figcaption>
</figure>

---

## Terceira rodada: Claude Code apontando para a OpenRouter

Nenhuma das duas rodadas anteriores me satisfez completamente. Os benchmarks mediam tokens de forma agregada, mas não capturavam bem o comportamento de um agente real navegando pelo código de forma interativa, lendo arquivo por arquivo, tomando decisões sobre o que ler a seguir.

Resolvi testar com o Claude Code, mas apontando para a OpenRouter. Configurei o arquivo `~/.claude/settings.json` para usar a OpenRouter como provider:

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/config_claude.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/config_claude.png" alt="Configuração do Claude Code apontando para a OpenRouter" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Configuração no ~/.claude/settings.json para usar a OpenRouter como provider</figcaption>
</figure>

Antes de começar, desabilitei todos os plugins do Claude Code. Plugins injetam contexto extra no prompt e isso contaminaria a medição, já que o objetivo era isolar o consumo causado pela estrutura do código.

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/plugins.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/plugins.png" alt="Todos os plugins desabilitados no Claude Code antes do teste" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Plugins desabilitados para não interferir na contagem de tokens</figcaption>
</figure>

O modelo escolhido foi o `qwen/qwen3.6-plus`, robusto, com janela de contexto de 1M de tokens. Mandei o mesmo prompt em cada pasta usando o próprio Claude Code, e depois de cada execução rodei `/usage` para capturar o consumo real de tokens e o custo estimado.

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-a.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-a.png" alt="Resultado /usage no project-a" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Projeto A - Monolítico, tudo em um único arquivo, sem separação de responsabilidades</figcaption>

</figure>

---

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-b.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-b.png" alt="Resultado /usage no project-b" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Projeto B - MVC, separação em Models, Controllers e Routes</figcaption>
</figure>

---

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-c.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-c.png" alt="Resultado /usage no project-c" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Projeto C - Strategy + Repository, estratégias de validação plugáveis e repositório para abstração de dados</figcaption>
</figure>

---

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-d.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-d.png" alt="Resultado /usage no project-d" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Projeto D - Clean Architecture (Hexagonal), camadas de domínio, aplicação e infraestrutura com inversão de dependência</figcaption>
</figure>

---

<figure style="text-align: center;">
  <a href="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-e.png" target="_blank">
    <img src="/blog/_content/qual-design-pattern-gasta-mais-tokens/project-e.png" alt="Resultado /usage no project-e" style="max-width: 65%; display: block; margin: 0 auto;" />
  </a>
  <figcaption>Projeto E - Observer/Event-Driven, event bus desacopla rotas da lógica de negócio via eventos</figcaption>
</figure>

| Projeto | Padrão | Input | Output | Total |
|---------|--------|------:|-------:|------:|
| A | Monolítico | 3,8k | 1,1k | 4,9k |
| B | MVC | 22,2k | 2,3k | 24,5k |
| C | Strategy + Repository | 47,7k | 3,6k | 51,3k |
| D | Clean Architecture | 25,1k | 2,7k | 27,8k |
| E | Observer/Event-Driven | 10,9k | 1,6k | 12,5k |

---

O benchmark está disponível no GitHub para quem quiser rodar na própria máquina: [github.com/josephfelix/design-patterns-token-benchmark](https://github.com/josephfelix/design-patterns-token-benchmark)

---

## Conclusão

O experimento mostrou que a resposta para "qual forma de organizar o código gasta mais tokens" depende de qual modelo está executando a tarefa.

Modelos menores, como os testados na primeira rodada com Ollama, gastam mais tokens em projetos simples. O projeto A, sem nenhum padrão, foi o que mais consumiu nessa rodada: sem estrutura orientando onde mexer, o modelo precisou gerar mais output para resolver a ambiguidade antes de escrever qualquer linha.

Com modelos mais robustos e bem treinados, a lógica se inverte. Esses modelos resolvem a ambiguidade do código simples com muito menos esforço, e o projeto A passou a ser um dos mais baratos. Na segunda rodada, os que mais consumiram foram o Observer/Event-Driven e o MVC, não necessariamente os padrões mais complexos na hierarquia de abstração. O experimento não permite concluir o porquê com precisão, mas fica claro que o custo por projeto muda conforme o modelo usado.

Na terceira rodada, usando o Claude Code como ferramenta de agente, o Observer/Event-Driven foi o que consumiu menos tokens entre todas as abordagens medidas. Vale notar que na segunda rodada esse mesmo padrão apareceu entre os maiores consumidores, o que reforça a tese central: o resultado muda conforme a ferramenta e o modelo. Com um agente navegando o código de forma interativa, lendo arquivo por arquivo e tomando decisões sobre o que ler a seguir, o desacoplamento via event bus produziu um código mais direto de navegar, cada parte do sistema com uma responsabilidade clara e as conexões entre elas explícitas nos eventos.

O que o experimento prova, no fim, é que otimizar consumo de tokens não é só uma questão de escolher uma organização de código mais simples. É uma combinação do padrão com o modelo que vai executar a tarefa. Um código sem estrutura pode custar mais caro do que um projeto com arquitetura bem definida, dependendo de quem está lendo.
