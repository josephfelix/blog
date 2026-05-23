# Blog — josephfelix.github.io/blog

Blog pessoal construído com Astro 6 e hospedado no GitHub Pages.

## Stack

- **Astro 6** — geração estática
- **Tailwind CSS v4** — estilização
- **TypeScript** — strict mode
- **GitHub Actions** — build e deploy automático

## Estrutura de posts

Cada post é uma pasta dentro de `src/content/`:

```
src/content/
  nome-do-post/
    index.md      ← conteúdo principal
    imagem.png    ← assets colocalizados
```

### Frontmatter obrigatório

```yaml
---
title: "Título do post"
date: 2026-05-22
type: project | tutorial | note | essay
tags: [tag1, tag2]
description: "Descrição curta usada no card e no OG."
draft: false
---
```

`cover` e `coverAlt` são opcionais. Se `cover` for definido, `coverAlt` é obrigatório.

## Desenvolvimento

```bash
npm install
npm run dev       # http://localhost:4321/blog/
npm run build     # gera dist/
npm test          # roda testes
```

## Deploy

Push para `main` dispara o workflow do GitHub Actions automaticamente.

Configuração necessária no repositório: **Settings → Pages → Source: GitHub Actions**

## Adicionando posts

1. Criar pasta em `src/content/nome-do-post/`
2. Criar `index.md` com frontmatter completo
3. Adicionar imagens na mesma pasta (referências relativas no markdown)
4. `git push origin main` — deploy automático
