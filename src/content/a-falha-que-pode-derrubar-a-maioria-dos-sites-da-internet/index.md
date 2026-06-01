---
title: "A falha que pode derrubar a maioria dos sites da internet"
date: 2026-05-31
type: security
tags: [segurança, nginx, cve, heap-overflow, rce, infosec]
description: "CVE-2026-42945: um padrão comum de rewrite no nginx abaixo de 1.31 causa heap buffer overflow com crash confiável. Está em tutoriais, stacks de produção, e a correção é uma linha."
cover: /blog/_content/a-falha-que-pode-derrubar-a-maioria-dos-sites-da-internet/cover.png
coverAlt: "Heap memory dump mostrando overflow durante ataque CVE-2026-42945 no nginx"
draft: false
---

nginx serve mais de 30% dos sites mais movimentados do mundo.

Existe um padrão de configuração que está em tutoriais, em stacks de produção, em repositórios de referência. Uma combinação de `rewrite` com grupo de captura posicional. Parece razoável. É o tipo de coisa que você escreve sem pensar duas vezes quando está migrando uma API.

Esse padrão causa heap buffer overflow com crash confiável. Com condições específicas, RCE.

Isso é o CVE-2026-42945.

---

## O padrão

```nginx
# VULNERÁVEL
location ~ ^/api/(.*)$ {
    rewrite ^/api/(.*)$ /internal?migrated=true;
}
```

O cenário é clássico: você tem uma API legada, está migrando para uma rota interna, quer preservar o endpoint original pra logging ou auditoria. Esse padrão resolve isso de forma limpa. Está em dezenas de tutoriais de migração de API com nginx.

A versão corrigida usa **named capture**:

```nginx
# CORRIGIDO
location ~ ^/api-safe/(?<endpoint>.*)$ {
    rewrite ^/api-safe/(?<endpoint>.*)$ /internal?migrated=true;
}
```

A diferença é uma mudança de sintaxe de regex. O impacto é a diferença entre um servidor que cai e um que não cai.

---

## Por que o rewrite quebra

Quando nginx executa `rewrite ^/api/(.*)$ /internal?migrated=true`, duas coisas acontecem em sequência:

1. O `?migrated=true` na substituição ativa `is_args = 1` no contexto do request
2. O grupo posicional `(.*)` capturado pela location regex precisa ser processado internamente, e aqui está o bug

Com grupo posicional, nginx aloca o buffer interno com o **tamanho raw** da string capturada (`is_args = 0`). Mas a cópia acontece com `is_args = 1` já ativo. Com `is_args = 1`, o encoder de URI expande `+` para `%2B`, e cada caractere vira três bytes.

O buffer foi alocado para `N` bytes. A cópia escreve até `3N` bytes. Overflow no pool do worker.

| Fase | is_args | Comportamento |
|---|---|---|
| alloc | 0 | tamanho = raw length do capture |
| copy  | 1 | `+` → `%2B`, escreve até 3x o esperado |
| resultado | — | overflow no pool do worker nginx |

Com named capture, o cálculo usa o mesmo contexto de escaping na alocação e na cópia. A divergência não existe.

---

## Do overflow ao crash

O PoC usa um payload estruturado em três partes:

```
"A" * 349   ← alinhamento do pool allocator
"+" * 969   ← 969 bytes raw → 2907 bytes com %2B → overflow de 1938 bytes
<addr>      ← endereço heap-sprayed da fake struct
```

Antes de disparar o trigger, 40 conexões abertas para `/spray` (com `client_body_in_single_buffer on`) colocam uma fake cleanup struct no pool em um offset previsível. Isso é o heap spray. O overflow do rewrite sobrescreve essa struct com um ponteiro para `system()`.

A sequência completa: spray → trigger em `/api/<payload>` → overflow sobrescreve struct → crash do worker.

![Exploit rodando: crash do worker nginx após payload estruturado](/blog/_content/a-falha-que-pode-derrubar-a-maioria-dos-sites-da-internet/exploit.png)

nginx reinicia o worker automaticamente. O master continua rodando. Com o timing certo, o ciclo se repete.

---

## O que os dados mostram

Rodei `benchmark.py` com 30 rounds contra cada rota, monitorando o worker via `/proc/<pid>/smaps` a cada 20ms.

**Rota vulnerável — padrão repetido em cada round:**

```
t=0.000s  heap=672 KB   (baseline)
t=2.006s  heap=1472 KB  (+800 KB — spray ativo, 40 conexões × 4 KB body)
t=2.570s  heap=672 KB   (worker_restart=1 — crash confirmado)
```

100% de crash rate. Tempo médio por round: 2.2s.

![Heap durante ataque, padrão dente de serra com crash periódico](/blog/_content/a-falha-que-pode-derrubar-a-maioria-dos-sites-da-internet/heap_timeline.png)

![Before vs after: heap baseline 0.66 MB, pico 1.45 MB (+0.8 MB por round)](/blog/_content/a-falha-que-pode-derrubar-a-maioria-dos-sites-da-internet/heap_before_after.png)

**Rota corrigida:**

```
heap=672 KB  (constante — todos os rounds)
worker_restart=0
```

O mesmo payload, o mesmo spray, nenhum efeito.

![Comparação vulnerable vs fixed, dente de serra vs linha reta](/blog/_content/a-falha-que-pode-derrubar-a-maioria-dos-sites-da-internet/heap_comparison.png)

---

## Como verificar se você está exposto

```bash
grep -rn "rewrite.*?" /etc/nginx/
```

Procure por qualquer `rewrite` com `?` na substituição dentro de um `location` com grupo de captura posicional `(.*)`. Essa combinação é o gatilho.

Condição exata:

```nginx
location ~ ^/algo/(.*)$ {          # grupo posicional (.*)
    rewrite .* /destino?param=val; # ? na substituição → is_args=1
    ...
}
```

Se você tiver isso, é candidato.

---

## Correção

**Opção 1: atualize para nginx 1.31 ou superior.** O bug foi corrigido upstream nessa versão.

**Opção 2: troque grupos posicionais por named captures** — funciona em todas as versões:

```nginx
# Antes
location ~ ^/api/(.*)$ {
    rewrite ^/api/(.*)$ /internal?migrated=true;
}

# Depois
location ~ ^/api/(?<endpoint>.*)$ {
    rewrite ^/api/(?<endpoint>.*)$ /internal?migrated=true;
}
```

Named captures fazem o nginx usar cálculo de tamanho escape-aware. O buffer é alocado já considerando a expansão potencial de caracteres. Sem divergência, sem overflow. Funciona em todas as versões.

Se você precisar preservar o endpoint para logging, `$endpoint` já está disponível como variável automaticamente pelo named capture — sem precisar de `set`.

---

## Versões afetadas

**Todas as versões do nginx abaixo de 1.31 são vulneráveis.** Testei 1.24.x, 1.26.x (mainline) e OpenResty 1.25.x, todos vulneráveis.

O nginx 1.31 corrige o bug no cálculo do tamanho do buffer no módulo de rewrite. Se você rodar 1.31 ou superior, não está exposto, mas o padrão de named captures ainda é a configuração correta e deve ser preferido independente da versão.

---

O PoC completo, o Dockerfile para reprodução, os scripts de benchmark e os notebooks de análise de heap estão em [github.com/josephfelix/CVE-2026-42945-nginx-rift](https://github.com/josephfelix/CVE-2026-42945-nginx-rift).

Esta vulnerabilidade foi reportada ao nginx security team antes desta publicação.

---

**Fonte:** [F5 Security Advisory K000161019](https://my.f5.com/manage/s/article/K000161019)
