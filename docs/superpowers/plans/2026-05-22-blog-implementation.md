# Blog Pessoal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal dev blog in Portuguese using Astro 5, deployable to GitHub Pages at `josephfelix.github.io/blog`.

**Architecture:** Single Astro 5 content collection with folder-based posts (each post is a directory with `index.md` + assets). Static output with Tailwind v4 and Medium-like design. GitHub Actions handles build + deploy.

**Tech Stack:** Astro 5, TypeScript (strict), Tailwind CSS v4, @tailwindcss/typography, @fontsource/lora, satori + @resvg/resvg-js (OG images), @astrojs/rss, @astrojs/sitemap, Vitest.

---

## File Map

```
/var/www/ia/blog/
├── .github/workflows/deploy.yml
├── public/
│   └── favicon.svg
├── src/
│   ├── content.config.ts              ← Zod schema da content collection
│   ├── env.d.ts
│   ├── content/
│   │   └── hello-world/
│   │       ├── index.md
│   │       └── cover.png
│   ├── utils/
│   │   ├── readingTime.ts
│   │   └── readingTime.test.ts
│   ├── components/
│   │   ├── BaseHead.astro             ← <head> com meta/OG tags
│   │   ├── ThemeToggle.astro          ← botão sol/lua + script anti-FOUC
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── TagBadge.astro
│   │   ├── Prose.astro
│   │   └── Sidebar.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro                ← homepage
│   │   ├── sobre.astro
│   │   ├── rss.xml.ts
│   │   ├── og/[slug].png.ts           ← OG image endpoint
│   │   ├── projects/index.astro
│   │   ├── tutorials/index.astro
│   │   ├── notes/index.astro
│   │   ├── essays/index.astro
│   │   ├── tags/[tag].astro
│   │   └── [slug].astro               ← post individual
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

---

### Task 1: Inicializar projeto Astro + Vitest

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/env.d.ts`

- [ ] **Step 1: Scaffold projeto**

```bash
cd /var/www/ia/blog
npm create astro@latest . -- --template minimal --typescript strict --no-git --install
```
Quando perguntar: TypeScript=strict, instalar dependências=yes, git=no.

- [ ] **Step 2: Instalar dependências**

```bash
npm install @fontsource/lora
npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography @astrojs/sitemap @astrojs/rss satori @resvg/resvg-js vitest
```

- [ ] **Step 3: Substituir astro.config.mjs**

```js
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://josephfelix.github.io',
  base: '/blog',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 4: Substituir tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 5: Criar vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 6: Adicionar script de teste em package.json**

No objeto `"scripts"` do `package.json`, adicionar:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Garantir src/env.d.ts existe com o conteúdo correto**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 8: Remover página de exemplo gerada pelo scaffold**

Se `src/pages/index.astro` foi gerado com conteúdo de placeholder do Astro, apague-o:
```bash
rm -f src/pages/index.astro
```
(Será criado do zero na Task 8.)

- [ ] **Step 9: Verificar build**

```bash
npm run build
```
Esperado: compila sem erros. Pasta `dist/` criada. Ok se não tiver páginas ainda — Astro avisa mas não falha.

- [ ] **Step 10: Inicializar git e commitar**

```bash
git init
git add .
git commit -m "feat: initialize Astro 5 project"
```

---

### Task 2: Tailwind v4 + CSS global + tema dark/light + fontes

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Criar src/styles/global.css**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    --color-bg: #ffffff;
    --color-text: #1a1a1a;
    --color-muted: #6b7280;
    --color-border: #e5e7eb;
    --color-accent: #1a8917;
    --color-surface: #f9fafb;
  }

  .dark {
    --color-bg: #121212;
    --color-text: #e8e8e8;
    --color-muted: #9ca3af;
    --color-border: #2a2a2a;
    --color-accent: #3db82e;
    --color-surface: #1e1e1e;
  }

  html {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: ui-sans-serif, system-ui, sans-serif;
    transition: background-color 0.2s, color 0.2s;
  }

  body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
}
```

- [ ] **Step 2: Commitar**

```bash
git add src/styles/global.css
git commit -m "feat: add Tailwind v4 global CSS with dark/light theme vars"
```

---

### Task 3: Content schema + utilitário readingTime + testes

**Files:**
- Create: `src/content.config.ts`, `src/utils/readingTime.ts`, `src/utils/readingTime.test.ts`

- [ ] **Step 1: Escrever o teste de readingTime (TDD — falha primeiro)**

```ts
// src/utils/readingTime.test.ts
import { expect, test } from 'vitest'
import { readingTime } from './readingTime'

test('retorna 1 para texto muito curto', () => {
  expect(readingTime('olá mundo')).toBe(1)
})

test('retorna 2 para 400 palavras', () => {
  const text = Array(400).fill('palavra').join(' ')
  expect(readingTime(text)).toBe(2)
})

test('retorna 1 para texto vazio', () => {
  expect(readingTime('')).toBe(1)
})

test('ignora espaços extras', () => {
  const text = '  palavra   outra  '
  expect(readingTime(text)).toBe(1)
})
```

- [ ] **Step 2: Rodar testes — confirmar falha**

```bash
npm test
```
Esperado: FAIL — "Cannot find module './readingTime'"

- [ ] **Step 3: Implementar readingTime**

```ts
// src/utils/readingTime.ts
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
```

- [ ] **Step 4: Rodar testes — confirmar pass**

```bash
npm test
```
Esperado: PASS — 4 testes passando.

- [ ] **Step 5: Criar src/content.config.ts**

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content',
    generateId: ({ entry }) => entry.replace('/index.md', ''),
  }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      type: z.enum(['project', 'tutorial', 'note', 'essay']),
      tags: z.array(z.string()),
      description: z.string(),
      cover: z.string().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    })
    .refine((data) => !data.cover || !!data.coverAlt, {
      message: 'coverAlt é obrigatório quando cover está definido',
      path: ['coverAlt'],
    }),
})

export const collections = { blog }
```

- [ ] **Step 6: Commitar**

```bash
git add src/content.config.ts src/utils/
git commit -m "feat: add content schema and readingTime utility"
```

---

### Task 4: Componente BaseHead

**Files:**
- Create: `src/components/BaseHead.astro`

- [ ] **Step 1: Criar src/components/BaseHead.astro**

```astro
---
interface Props {
  title: string
  description: string
  slug?: string
  image?: string
}

const { title, description, slug, image } = Astro.props
const siteUrl = 'https://josephfelix.github.io'
const baseUrl = `${siteUrl}/blog`
const canonicalUrl = slug ? `${baseUrl}/${slug}/` : `${baseUrl}/`
const ogImage = image ?? (slug ? `${baseUrl}/og/${slug}.png` : `${baseUrl}/og/default.png`)
const fullTitle = title === 'Blog' ? 'Joseph Felix — Blog' : `${title} — Joseph Felix`
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href={canonicalUrl} />
<link rel="stylesheet" href="/blog/styles/global.css" />
<link rel="alternate" type="application/rss+xml" title="Joseph Felix — Blog" href={`${baseUrl}/rss.xml`} />

<title>{fullTitle}</title>
<meta name="description" content={description} />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/blog/favicon.svg" />

<!-- Anti-FOUC: define tema antes do primeiro paint -->
<script is:inline>
  ;(function () {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
  })()
</script>
```

Nota: o import do CSS global precisa usar o path correto com o `base`. Astro resolve isso via `<link>` explícita ou importando no layout. Prefira importar no layout (Task 7).

- [ ] **Step 2: Corrigir o import do CSS — remover a linha `<link rel="stylesheet">` do BaseHead**

O CSS global será importado via `import` no BaseLayout (Task 7). Remova esta linha do BaseHead:
```
<link rel="stylesheet" href="/blog/styles/global.css" />
```

BaseHead.astro final (sem a linha de CSS):
```astro
---
interface Props {
  title: string
  description: string
  slug?: string
  image?: string
}

const { title, description, slug, image } = Astro.props
const siteUrl = 'https://josephfelix.github.io'
const baseUrl = `${siteUrl}/blog`
const canonicalUrl = slug ? `${baseUrl}/${slug}/` : `${baseUrl}/`
const ogImage = image ?? (slug ? `${baseUrl}/og/${slug}.png` : `${baseUrl}/og/default.png`)
const fullTitle = title === 'Blog' ? 'Joseph Felix — Blog' : `${title} — Joseph Felix`
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href={canonicalUrl} />
<link rel="alternate" type="application/rss+xml" title="Joseph Felix — Blog" href={`${baseUrl}/rss.xml`} />

<title>{fullTitle}</title>
<meta name="description" content={description} />

<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

<link rel="icon" type="image/svg+xml" href="/blog/favicon.svg" />

<script is:inline>
  ;(function () {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)
  })()
</script>
```

- [ ] **Step 3: Criar placeholder de favicon**

```bash
mkdir -p /var/www/ia/blog/public
```

```svg
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1a8917"/>
  <text x="16" y="23" font-size="18" text-anchor="middle" fill="white" font-family="serif" font-weight="bold">J</text>
</svg>
```

Salve em `public/favicon.svg`.

- [ ] **Step 4: Commitar**

```bash
git add src/components/BaseHead.astro public/favicon.svg
git commit -m "feat: add BaseHead component with OG tags and anti-FOUC theme script"
```

---

### Task 5: Nav + ThemeToggle + Footer

**Files:**
- Create: `src/components/Nav.astro`, `src/components/ThemeToggle.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Criar src/components/ThemeToggle.astro**

```astro
---
---
<button
  id="theme-toggle"
  aria-label="Alternar tema claro/escuro"
  class="p-2 rounded-md hover:bg-[var(--color-surface)] transition-colors"
>
  <svg id="icon-sun" class="w-5 h-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 110 14A7 7 0 0112 5z"/>
  </svg>
  <svg id="icon-moon" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
</button>

<script>
  function syncIcons() {
    const isDark = document.documentElement.classList.contains('dark')
    document.getElementById('icon-sun')?.classList.toggle('hidden', !isDark)
    document.getElementById('icon-moon')?.classList.toggle('hidden', isDark)
  }

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    syncIcons()
  })

  syncIcons()
</script>
```

- [ ] **Step 2: Criar src/components/Nav.astro**

```astro
---
import ThemeToggle from './ThemeToggle.astro'

const base = '/blog'
const links = [
  { href: `${base}/`, label: 'Início' },
  { href: `${base}/projects/`, label: 'Projetos' },
  { href: `${base}/tutorials/`, label: 'Tutoriais' },
  { href: `${base}/notes/`, label: 'Notas' },
  { href: `${base}/essays/`, label: 'Ensaios' },
  { href: `${base}/sobre/`, label: 'Sobre' },
]

const current = Astro.url.pathname
---

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-accent)] focus:text-white focus:rounded">
  Pular para conteúdo
</a>

<nav class="border-b border-[var(--color-border)] bg-[var(--color-bg)]" aria-label="Navegação principal">
  <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
    <a href={`${base}/`} class="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
      Joseph Felix
    </a>

    <div class="flex items-center gap-1">
      <ul class="hidden md:flex items-center gap-1 mr-2" role="list">
        {links.map(link => (
          <li>
            <a
              href={link.href}
              class={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                current === link.href
                  ? 'text-[var(--color-accent)] font-medium'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
              aria-current={current === link.href ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle />
    </div>
  </div>
</nav>
```

- [ ] **Step 3: Criar src/components/Footer.astro**

```astro
---
const year = new Date().getFullYear()
---

<footer class="mt-auto border-t border-[var(--color-border)] py-8 text-sm text-[var(--color-muted)]">
  <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
    <span>© {year} Joseph Felix</span>
    <div class="flex gap-4">
      <a href="/blog/rss.xml" class="hover:text-[var(--color-text)] transition-colors">RSS</a>
      <a href="https://github.com/josephfelix" class="hover:text-[var(--color-text)] transition-colors" rel="noopener">GitHub</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Commitar**

```bash
git add src/components/
git commit -m "feat: add Nav, ThemeToggle, and Footer components"
```

---

### Task 6: PostCard + TagBadge + Prose + Sidebar

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/TagBadge.astro`, `src/components/Prose.astro`, `src/components/Sidebar.astro`

- [ ] **Step 1: Criar src/components/TagBadge.astro**

```astro
---
interface Props {
  tag: string
  href?: string
}
const { tag, href } = Astro.props
const base = '/blog'
const link = href ?? `${base}/tags/${encodeURIComponent(tag)}/`
---

<a
  href={link}
  class="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
>
  {tag}
</a>
```

- [ ] **Step 2: Criar src/components/PostCard.astro**

```astro
---
import TagBadge from './TagBadge.astro'

interface Props {
  title: string
  date: Date
  description: string
  slug: string
  type: 'project' | 'tutorial' | 'note' | 'essay'
  tags: string[]
  readingTime: number
}

const { title, date, description, slug, type, tags, readingTime } = Astro.props

const typeLabel: Record<string, string> = {
  project: 'Projeto',
  tutorial: 'Tutorial',
  note: 'Nota',
  essay: 'Ensaio',
}

const formattedDate = date.toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
---

<article class="py-8 border-b border-[var(--color-border)] last:border-b-0">
  <div class="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-2">
    <span class="uppercase tracking-wider font-medium text-[var(--color-accent)]">
      {typeLabel[type]}
    </span>
    <span>·</span>
    <time datetime={date.toISOString()}>{formattedDate}</time>
    <span>·</span>
    <span>{readingTime} min de leitura</span>
  </div>

  <a href={`/blog/${slug}/`} class="group block">
    <h2 class="text-xl font-serif font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors mb-2">
      {title}
    </h2>
    <p class="text-[var(--color-muted)] leading-relaxed line-clamp-3">
      {description}
    </p>
  </a>

  {tags.length > 0 && (
    <div class="mt-3 flex flex-wrap gap-1">
      {tags.map(tag => <TagBadge tag={tag} />)}
    </div>
  )}
</article>
```

- [ ] **Step 3: Criar src/components/Prose.astro**

```astro
---
---
<div class="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-code:before:content-none prose-code:after:content-none">
  <slot />
</div>
```

- [ ] **Step 4: Criar src/components/Sidebar.astro**

```astro
---
import TagBadge from './TagBadge.astro'

interface SidebarPost {
  id: string
  data: {
    title: string
    date: Date
    tags: string[]
    type: string
  }
}

interface Props {
  posts: SidebarPost[]
  currentSlug: string
}

const { posts, currentSlug } = Astro.props
const others = posts.filter(p => p.id !== currentSlug).slice(0, 5)
---

{others.length > 0 && (
  <aside aria-label="Outros artigos" class="space-y-6">
    <h3 class="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
      Leia também
    </h3>
    <ul class="space-y-4" role="list">
      {others.map(post => (
        <li>
          <a href={`/blog/${post.id}/`} class="group block">
            <p class="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
              {post.data.title}
            </p>
            <p class="text-xs text-[var(--color-muted)] mt-1">
              {post.data.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </a>
        </li>
      ))}
    </ul>
  </aside>
)}
```

- [ ] **Step 5: Commitar**

```bash
git add src/components/
git commit -m "feat: add PostCard, TagBadge, Prose, and Sidebar components"
```

---

### Task 7: BaseLayout + PostLayout

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/layouts/PostLayout.astro`

- [ ] **Step 1: Criar src/layouts/BaseLayout.astro**

```astro
---
import BaseHead from '@/components/BaseHead.astro'
import Nav from '@/components/Nav.astro'
import Footer from '@/components/Footer.astro'
import '@/styles/global.css'
import '@fontsource/lora/400.css'
import '@fontsource/lora/700.css'

interface Props {
  title: string
  description: string
  slug?: string
  image?: string
}

const { title, description, slug, image } = Astro.props
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <BaseHead {title} {description} {slug} {image} />
  </head>
  <body class="bg-[var(--color-bg)] text-[var(--color-text)]">
    <Nav />
    <main id="main-content">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Criar src/layouts/PostLayout.astro**

```astro
---
import BaseLayout from './BaseLayout.astro'
import Prose from '@/components/Prose.astro'
import TagBadge from '@/components/TagBadge.astro'
import Sidebar from '@/components/Sidebar.astro'

interface SidebarPost {
  id: string
  data: {
    title: string
    date: Date
    tags: string[]
    type: string
  }
}

interface Props {
  title: string
  description: string
  date: Date
  type: 'project' | 'tutorial' | 'note' | 'essay'
  tags: string[]
  slug: string
  readingTime: number
  cover?: string
  coverAlt?: string
  relatedPosts: SidebarPost[]
}

const { title, description, date, type, tags, slug, readingTime, cover, coverAlt, relatedPosts } = Astro.props

const typeLabel: Record<string, string> = {
  project: 'Projeto',
  tutorial: 'Tutorial',
  note: 'Nota',
  essay: 'Ensaio',
}

const formattedDate = date.toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
---

<BaseLayout {title} {description} {slug}>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
      <!-- Conteúdo principal -->
      <article>
        <header class="mb-8">
          <div class="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-4">
            <span class="uppercase tracking-wider font-medium text-[var(--color-accent)] text-xs">
              {typeLabel[type]}
            </span>
            <span>·</span>
            <time datetime={date.toISOString()}>{formattedDate}</time>
            <span>·</span>
            <span>{readingTime} min de leitura</span>
          </div>

          <h1 class="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text)] leading-tight mb-4">
            {title}
          </h1>

          <p class="text-lg text-[var(--color-muted)] leading-relaxed mb-6">
            {description}
          </p>

          {tags.length > 0 && (
            <div class="flex flex-wrap gap-1">
              {tags.map(tag => <TagBadge tag={tag} />)}
            </div>
          )}
        </header>

        {cover && coverAlt && (
          <img
            src={cover}
            alt={coverAlt}
            class="w-full rounded-xl mb-8 aspect-video object-cover"
            width="800"
            height="450"
          />
        )}

        <Prose>
          <slot />
        </Prose>
      </article>

      <!-- Sidebar -->
      <div class="hidden lg:block">
        <div class="sticky top-8">
          <Sidebar posts={relatedPosts} currentSlug={slug} />
        </div>
      </div>
    </div>

    <!-- Leia também (mobile) -->
    <div class="lg:hidden mt-12 pt-8 border-t border-[var(--color-border)]">
      <Sidebar posts={relatedPosts} currentSlug={slug} />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Commitar**

```bash
git add src/layouts/
git commit -m "feat: add BaseLayout and PostLayout"
```

---

### Task 8: Homepage

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Criar src/pages/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

const posts = await getCollection('blog', p => !p.data.draft)
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title="Blog" description="Posts sobre programação, projetos e tecnologia por Joseph Felix.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <header class="mb-12">
      <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-3">
        Joseph Felix
      </h1>
      <p class="text-lg text-[var(--color-muted)]">
        Posts sobre programação, projetos e tecnologia.
      </p>
    </header>

    {sorted.length === 0 ? (
      <p class="text-[var(--color-muted)]">Nenhum post ainda.</p>
    ) : (
      <div>
        {sorted.map(post => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            slug={post.id}
            type={post.data.type}
            tags={post.data.tags}
            readingTime={readingTime(post.body ?? '')}
          />
        ))}
      </div>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Esperado: compila sem erros.

- [ ] **Step 3: Commitar**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage"
```

---

### Task 9: Página de post individual

**Files:**
- Create: `src/pages/[slug].astro`

- [ ] **Step 1: Criar src/pages/[slug].astro**

```astro
---
import { getCollection, render } from 'astro:content'
import PostLayout from '@/layouts/PostLayout.astro'
import { readingTime } from '@/utils/readingTime'

export async function getStaticPaths() {
  const posts = await getCollection('blog', p => !p.data.draft)
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }))
}

const { post } = Astro.props
const { Content } = await render(post)

const allPosts = await getCollection('blog', p => !p.data.draft)

const relatedPosts = allPosts
  .filter(p => p.id !== post.id)
  .sort((a, b) => {
    const aCommon = a.data.tags.filter(t => post.data.tags.includes(t)).length
    const bCommon = b.data.tags.filter(t => post.data.tags.includes(t)).length
    if (bCommon !== aCommon) return bCommon - aCommon
    return b.data.date.getTime() - a.data.date.getTime()
  })
  .slice(0, 5)
  .map(p => ({ id: p.id, data: p.data }))
---

<PostLayout
  title={post.data.title}
  description={post.data.description}
  date={post.data.date}
  type={post.data.type}
  tags={post.data.tags}
  slug={post.id}
  readingTime={readingTime(post.body ?? '')}
  cover={post.data.cover}
  coverAlt={post.data.coverAlt}
  relatedPosts={relatedPosts}
>
  <Content />
</PostLayout>
```

- [ ] **Step 2: Commitar**

```bash
git add src/pages/[slug].astro
git commit -m "feat: add individual post page"
```

---

### Task 10: Páginas de listagem por tipo

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/tutorials/index.astro`, `src/pages/notes/index.astro`, `src/pages/essays/index.astro`

- [ ] **Step 1: Criar src/pages/projects/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

const posts = await getCollection('blog', p => !p.data.draft && p.data.type === 'project')
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title="Projetos" description="Write-ups dos projetos que construí.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Projetos</h1>
    <p class="text-[var(--color-muted)] mb-10">Write-ups dos projetos que construí.</p>
    {sorted.length === 0
      ? <p class="text-[var(--color-muted)]">Nenhum post ainda.</p>
      : sorted.map(post => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            slug={post.id}
            type={post.data.type}
            tags={post.data.tags}
            readingTime={readingTime(post.body ?? '')}
          />
        ))
    }
  </div>
</BaseLayout>
```

- [ ] **Step 2: Criar src/pages/tutorials/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

const posts = await getCollection('blog', p => !p.data.draft && p.data.type === 'tutorial')
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title="Tutoriais" description="Guias passo a passo sobre programação e tecnologia.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Tutoriais</h1>
    <p class="text-[var(--color-muted)] mb-10">Guias passo a passo sobre programação e tecnologia.</p>
    {sorted.length === 0
      ? <p class="text-[var(--color-muted)]">Nenhum post ainda.</p>
      : sorted.map(post => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            slug={post.id}
            type={post.data.type}
            tags={post.data.tags}
            readingTime={readingTime(post.body ?? '')}
          />
        ))
    }
  </div>
</BaseLayout>
```

- [ ] **Step 3: Criar src/pages/notes/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

const posts = await getCollection('blog', p => !p.data.draft && p.data.type === 'note')
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title="Notas" description="Aprendizados rápidos, snippets e observações.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Notas</h1>
    <p class="text-[var(--color-muted)] mb-10">Aprendizados rápidos, snippets e observações.</p>
    {sorted.length === 0
      ? <p class="text-[var(--color-muted)]">Nenhum post ainda.</p>
      : sorted.map(post => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            slug={post.id}
            type={post.data.type}
            tags={post.data.tags}
            readingTime={readingTime(post.body ?? '')}
          />
        ))
    }
  </div>
</BaseLayout>
```

- [ ] **Step 4: Criar src/pages/essays/index.astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

const posts = await getCollection('blog', p => !p.data.draft && p.data.type === 'essay')
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title="Ensaios" description="Reflexões e opiniões sobre tecnologia.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Ensaios</h1>
    <p class="text-[var(--color-muted)] mb-10">Reflexões e opiniões sobre tecnologia.</p>
    {sorted.length === 0
      ? <p class="text-[var(--color-muted)]">Nenhum post ainda.</p>
      : sorted.map(post => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            slug={post.id}
            type={post.data.type}
            tags={post.data.tags}
            readingTime={readingTime(post.body ?? '')}
          />
        ))
    }
  </div>
</BaseLayout>
```

- [ ] **Step 5: Commitar**

```bash
git add src/pages/projects/ src/pages/tutorials/ src/pages/notes/ src/pages/essays/
git commit -m "feat: add type listing pages (projects, tutorials, notes, essays)"
```

---

### Task 11: Listagem por tag + Página Sobre

**Files:**
- Create: `src/pages/tags/[tag].astro`, `src/pages/sobre.astro`

- [ ] **Step 1: Criar src/pages/tags/[tag].astro**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '@/layouts/BaseLayout.astro'
import PostCard from '@/components/PostCard.astro'
import { readingTime } from '@/utils/readingTime'

export async function getStaticPaths() {
  const posts = await getCollection('blog', p => !p.data.draft)
  const tags = [...new Set(posts.flatMap(p => p.data.tags))]
  return tags.map(tag => ({
    params: { tag },
    props: { tag, posts: posts.filter(p => p.data.tags.includes(tag)) },
  }))
}

const { tag, posts } = Astro.props
const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
---

<BaseLayout title={`#${tag}`} description={`Posts com a tag "${tag}".`}>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">#{tag}</h1>
    <p class="text-[var(--color-muted)] mb-10">{sorted.length} post{sorted.length !== 1 ? 's' : ''} com esta tag.</p>
    {sorted.map(post => (
      <PostCard
        title={post.data.title}
        date={post.data.date}
        description={post.data.description}
        slug={post.id}
        type={post.data.type}
        tags={post.data.tags}
        readingTime={readingTime(post.body ?? '')}
      />
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Criar src/pages/sobre.astro**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
---

<BaseLayout title="Sobre" description="Quem é Joseph Felix e o que você vai encontrar neste blog.">
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-serif font-bold text-[var(--color-text)] mb-6">Sobre</h1>
    <div class="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif">
      <p>
        Olá! Sou Joseph Felix, desenvolvedor de software baseado no Brasil.
        Escrevo sobre os projetos que estou construindo, ferramentas que uso e ideias que acho interessantes.
      </p>
      <p>
        Você vai encontrar aqui: write-ups de projetos, tutoriais técnicos, notas rápidas (TILs)
        e ensaios sobre tecnologia e desenvolvimento de software.
      </p>
      <h2>Links</h2>
      <ul>
        <li><a href="https://github.com/josephfelix">GitHub</a></li>
        <li><a href="/blog/rss.xml">Feed RSS</a></li>
      </ul>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Commitar**

```bash
git add src/pages/tags/ src/pages/sobre.astro
git commit -m "feat: add tag listing page and about page"
```

---

### Task 12: Feed RSS

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Criar src/pages/rss.xml.ts**

```ts
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', p => !p.data.draft)
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

  return rss({
    title: 'Joseph Felix — Blog',
    description: 'Posts sobre programação, projetos e tecnologia.',
    site: context.site!,
    items: sorted.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>pt-BR</language>',
  })
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Esperado: `dist/blog/rss.xml` gerado sem erros.

- [ ] **Step 3: Commitar**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed"
```

---

### Task 13: OG Image endpoint (satori + resvg-js)

**Files:**
- Create: `src/pages/og/[slug].png.ts`

- [ ] **Step 1: Criar src/pages/og/[slug].png.ts**

```ts
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function h(
  type: string,
  props: Record<string, unknown>,
  ...children: unknown[]
): Record<string, unknown> {
  return {
    type,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children.length > 0 ? children : undefined,
    },
  }
}

let fontData: Buffer | null = null

function getFont(): Buffer {
  if (!fontData) {
    fontData = readFileSync(
      resolve('./node_modules/@fontsource/lora/files/lora-latin-400-normal.woff')
    )
  }
  return fontData
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', p => !p.data.draft)
  return posts.map(post => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
      type: post.data.type,
    },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as {
    title: string
    description: string
    type: string
  }

  const typeMap: Record<string, string> = {
    project: 'Projeto',
    tutorial: 'Tutorial',
    note: 'Nota',
    essay: 'Ensaio',
  }

  const element = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        backgroundColor: '#ffffff',
        fontFamily: 'Lora',
      },
    },
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('p', { style: { fontSize: 14, color: '#1a8917', fontWeight: 600, margin: 0 } }, typeMap[(props as { type: string }).type] ?? ''),
      h(
        'h1',
        {
          style: {
            fontSize: title.length > 60 ? 36 : 48,
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.2,
            margin: 0,
          },
        },
        title
      ),
      h(
        'p',
        { style: { fontSize: 20, color: '#6b7280', margin: 0, lineHeight: 1.5 } },
        description.length > 120 ? description.slice(0, 117) + '…' : description
      )
    ),
    h(
      'p',
      { style: { fontSize: 16, color: '#9ca3af', margin: 0 } },
      'josephfelix.github.io/blog'
    )
  )

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Lora',
        data: getFont(),
        weight: 400,
        style: 'normal',
      },
    ],
  })

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  })
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```
Esperado: `dist/blog/og/hello-world.png` gerado (após Task 14 adicionar o post).

- [ ] **Step 3: Commitar**

```bash
git add src/pages/og/
git commit -m "feat: add OG image endpoint with satori and resvg-js"
```

---

### Task 14: Post hello-world de teste

**Files:**
- Create: `src/content/hello-world/index.md`

- [ ] **Step 1: Criar src/content/hello-world/index.md**

````markdown
---
title: "Hello, World — Apresentando o Blog"
date: 2026-05-22
type: note
tags: [meta, blog, astro]
description: "Primeiro post do blog. Explico o que esperar por aqui: projetos, tutoriais, notas rápidas e ensaios sobre tecnologia."
draft: false
---

Bem-vindo ao blog.

Depois de anos guardando anotações em arquivos locais e notebooks espalhados, resolvi centralizar tudo em um lugar público. A ideia é simples: escrever sobre o que estou construindo, o que estou aprendendo e o que acho interessante em tecnologia.

## O que você vai encontrar aqui

**Projetos** — write-ups de sistemas que construí, decisões de arquitetura, o que funcionou e o que não funcionou.

**Tutoriais** — guias passo a passo para coisas que precisei fazer e não encontrei explicação boa em português.

**Notas** — aprendizados rápidos do tipo "hoje aprendi que...". Curtos, diretos, sem cerimônia.

**Ensaios** — textos mais longos sobre ideias e opiniões sobre o desenvolvimento de software.

## Stack deste blog

O blog é construído com [Astro 5](https://astro.build) e hospedado no GitHub Pages. Posts são arquivos Markdown em um repositório git — sem CMS, sem banco de dados. Cada post tem sua própria pasta com imagens e arquivos de suporte colocalizados.

O design é inspirado no Medium: tipografia generosa, foco no conteúdo, dark mode.

## Próximos posts

Tenho alguns projetos interessantes para escrever sobre em breve. Assine o [RSS](/blog/rss.xml) se quiser acompanhar.
````

- [ ] **Step 2: Rodar build completo e verificar**

```bash
npm run build
```
Esperado sem erros. Verificar que estes arquivos existem em `dist/`:
- `dist/blog/index.html`
- `dist/blog/hello-world/index.html`
- `dist/blog/og/hello-world.png`
- `dist/blog/rss.xml`
- `dist/blog/notes/index.html`

- [ ] **Step 3: Rodar dev server e verificar visualmente**

```bash
npm run dev
```
Abrir `http://localhost:4321/blog/` e verificar:
- Homepage mostra o card do post hello-world
- Clicar no post abre `/blog/hello-world/`
- Dark mode toggle funciona (sem flash ao recarregar)
- Tags clicáveis levam para `/blog/tags/meta/` etc.
- Sidebar aparece em desktop

- [ ] **Step 4: Commitar**

```bash
git add src/content/
git commit -m "feat: add hello-world sample post"
```

---

### Task 15: GitHub Actions — build e deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Criar .github/workflows/deploy.yml**

```bash
mkdir -p .github/workflows
```

```yaml
# .github/workflows/deploy.yml
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

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

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

- [ ] **Step 2: Criar repositório no GitHub e fazer push**

```bash
git remote add origin https://github.com/josephfelix/blog.git
git branch -M main
git push -u origin main
```
Substituir URL pelo repositório real.

- [ ] **Step 3: Habilitar GitHub Pages**

No repositório GitHub:
1. Settings → Pages
2. Source: **GitHub Actions**
3. Salvar

- [ ] **Step 4: Verificar pipeline**

No repositório GitHub → Actions → verificar que o workflow `Deploy to GitHub Pages` rodou e passou.
URL final: `https://josephfelix.github.io/blog/`

- [ ] **Step 5: Commitar o workflow**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy workflow"
git push origin main
```

---

## Self-Review

### Cobertura do spec

| Requisito do spec | Task que implementa |
|---|---|
| Astro 5 + TypeScript + Tailwind v4 | Task 1, 2 |
| Content collection com pastas por post | Task 3 |
| Frontmatter Zod com refine (cover/coverAlt) | Task 3 |
| Páginas: home, post, type listings, tags, sobre, RSS | Tasks 8–12 |
| Tipografia serif (Lora) | Task 2, 7 |
| Layout Medium-like duas colunas | Task 7 |
| Dark/light mode sem FOUC | Task 4 (script inline), Task 5 (toggle) |
| OpenGraph + Twitter Card | Task 4 |
| OG image via satori + fallback text-only | Task 13 |
| Skip-to-content link | Task 5 |
| Contraste WCAG AA | Task 2 (CSS vars com contraste validado) |
| `coverAlt` obrigatório com Zod refine | Task 3 |
| Tempo de leitura calculado no build | Task 3, PostCard, PostLayout |
| Sidebar com prioridade por tag | Task 9 (lógica de sort) |
| RSS feed | Task 12 |
| Sitemap | Task 1 (@astrojs/sitemap) |
| Post hello-world com frontmatter completo | Task 14 |
| GitHub Actions build + deploy | Task 15 |

Nenhum requisito do spec sem cobertura.

### Tipo consistency

- `readingTime(text: string): number` — definido em Task 3, usado em Tasks 8, 9, 10, 11. Consistente.
- `post.id` como slug — definido no schema Task 3 (`generateId`), usado em Tasks 8, 9, 10, 11, 13. Consistente.
- `post.body` (string) — acessado em Tasks 8, 9, 10, 11 como `post.body ?? ''`. Consistente.
- Props de `PostCard` — definidas em Task 6, usadas nas mesmas formas em Tasks 8, 10, 11. Consistente.
- `relatedPosts` type `{ id: string, data: { title, date, tags, type } }[]` — definido em Task 7 (PostLayout), produzido em Task 9. Consistente.
