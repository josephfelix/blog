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
      children:
        children.length === 1 ? children[0] : children.length > 0 ? children : undefined,
    },
  }
}

let fontData: Buffer | null = null

function getFont(): Buffer {
  if (!fontData) {
    fontData = readFileSync(
      resolve('./node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff')
    )
  }
  return fontData
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', p => !p.data.draft)
  return posts.map(post => ({
    params: { slug: post.id },
    props: {
      title: post.data.ogTitle ?? post.data.title,
      type: post.data.type,
    },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { title, type } = props as { title: string; type: string }

  const typeMap: Record<string, string> = {
    project: 'PROJETO',
    tutorial: 'TUTORIAL',
    article: 'ARTIGO',
    security: 'SEGURANÇA',
  }

  const displayTitle = title.length > 60 ? title.slice(0, 57) + '…' : title

  const element = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#0f172a',
        fontFamily: 'Source Serif 4',
      },
    },
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
      h(
        'p',
        {
          style: {
            fontSize: 14,
            color: '#e94560',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '0.12em',
          },
        },
        typeMap[type] ?? 'POST'
      ),
      h(
        'h1',
        {
          style: {
            fontSize: displayTitle.length > 45 ? 40 : 52,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.2,
            margin: 0,
          },
        },
        displayTitle
      )
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      h(
        'p',
        { style: { fontSize: 18, color: '#94a3b8', margin: 0 } },
        'josephfelix.dev/blog'
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#e94560',
            padding: '12px 24px',
            borderRadius: '8px',
          },
        },
        h(
          'p',
          { style: { fontSize: 16, color: '#ffffff', margin: 0, fontWeight: 600 } },
          'Ler artigo >>'
        )
      )
    )
  )

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Source Serif 4',
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
