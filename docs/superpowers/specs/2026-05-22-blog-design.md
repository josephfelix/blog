# Blog Pessoal — Design Spec

**Data:** 2026-05-22
**Stack:** Astro 5 + TypeScript + Tailwind CSS
**Hospedagem:** GitHub Pages (`josephfelix.github.io/blog`)

---

## 1. Arquitetura

### Stack
- Astro 5, output `static`
- TypeScript
- Tailwind CSS v4
- Sem backend, sem banco de dados

### Estrutura de conteúdo
Uma única content collection. Cada post é uma pasta com slug em português:

```
src/content/
  hello-world/
    index.md
    cover.png
  apresentando-o-projeto-sonara/
    index.md
    screenshot.png
  como-usar-redis-com-python/
    index.md
    config.yml
```

### Frontmatter (Zod schema)
```yaml
title: string          # título do post
date: date             # data de publicação
type: project | tutorial | note | essay
tags: string[]
description: string    # usado no OG e listagens
cover: string?         # opcional — caminho relativo para imagem de capa
coverAlt: string?      # obrigatório se cover presente (Zod refine)
draft: boolean         # true = não publicado no build
```

### Páginas
| Rota | Descrição |
|------|-----------|
| `/blog/` | Homepage — posts recentes de todas as coleções |
| `/blog/[slug]/` | Post individual |
| `/blog/projects/` | Listagem filtrada por `type: project` |
| `/blog/tutorials/` | Listagem filtrada por `type: tutorial` |
| `/blog/notes/` | Listagem filtrada por `type: note` |
| `/blog/essays/` | Listagem filtrada por `type: essay` |
| `/blog/tags/[tag]/` | Posts filtrados por tag |
| `/blog/sobre/` | Página sobre |
| `/blog/rss.xml` | Feed RSS global |

### Astro config
```ts
base: '/blog',
output: 'static',
integrations: [tailwind(), sitemap()],
```

---

## 2. Visual & UX

### Inspiração
Medium — limpo, foco no texto, tipografia generosa.

### Tipografia
- **Corpo do post:** serif (`Lora` via `@fontsource/lora`), `text-xl`, line-height `1.8`
- **Títulos:** serif, hierarquia clara (h1 grande, h2/h3 menores)
- **UI (nav, badges, meta):** sans-serif system stack

### Layout do post
Duas colunas em desktop, coluna única em mobile:

```
┌──────────────────────────┬────────────────────┐
│  Título                  │  Outros artigos    │
│  Autor · Data · X min    │  (sticky sidebar)  │
│  Tags                    │                    │
│  ────────────────────    │  • Artigo A        │
│  Conteúdo do post...     │  • Artigo B        │
│                          │  • Artigo C        │
└──────────────────────────┴────────────────────┘
```

Sidebar sticky em desktop. Em mobile: some, aparece como lista "Leia também" abaixo do post.

### Dark/Light mode
- Toggle manual com ícone sol/lua na nav
- Respeita `prefers-color-scheme` na primeira visita
- Estado salvo em `localStorage`
- Script inline no `<head>` antes do paint — sem flash (FOUC)

### Componentes
| Componente | Uso |
|-----------|-----|
| `BaseLayout` | head, nav, footer, OG tags |
| `PostCard` | card de listagem (título, data, tipo, excerpt) |
| `TagBadge` | pill clicável de tag |
| `Prose` | wrapper do markdown com Tailwind typography |
| `Sidebar` | lista de artigos recentes (mesma tag primeiro, depois recentes), sticky |
| `ReadingTime` | "X min de leitura" calculado no build |

---

## 3. SEO & Performance

### OpenGraph
Gerado em `BaseLayout` por post:
```html
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:image" content="/blog/og/{slug}.png" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

OG image gerada estaticamente via `satori` + `resvg-js` — endpoint Astro em `/blog/og/[slug].png.ts`. Posts sem capa recebem OG image text-only (título + data em layout fixo).

### Web Vitals
- Output 100% estático — zero JS de framework em runtime
- Imagens via `<Image />` do Astro (WebP automático, dimensões explícitas = sem CLS)
- Fonte com `font-display: swap`
- Tailwind purge — CSS mínimo
- Sitemap automático via `@astrojs/sitemap`
- RSS via `@astrojs/rss`

### Acessibilidade
- HTML semântico: `<article>`, `<nav>`, `<main>`, `<aside>`
- Skip-to-content link visível no foco
- Contraste mínimo WCAG AA em ambos os temas
- `coverAlt` obrigatório no schema Zod

---

## 4. Conteúdo Inicial

Post de teste incluído no repo:

```
src/content/
  hello-world/
    index.md    ← frontmatter completo, ~300 palavras de conteúdo real
    cover.png   ← imagem placeholder
```

Objetivo: validar schema, layout, sidebar, dark mode, e OG image no primeiro deploy.

---

## 5. CI/CD — GitHub Actions

Arquivo: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Pré-requisito:** Settings do repo → Pages → Source = **GitHub Actions**.

---

## 6. Slugs & Unicidade

Slugs são o nome da pasta em `src/content/`. Devem ser:
- Em português, kebab-case
- Únicos globalmente (sem prefixo de tipo na URL)
- Descritivos o suficiente para evitar colisão futura

Exemplo: `apresentando-o-projeto-sonara` não `sonara`.
