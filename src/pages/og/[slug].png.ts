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
  const { title, description, type } = props as {
    title: string
    description: string
    type: string
  }

  const typeMap: Record<string, string> = {
    project: 'Projeto',
    tutorial: 'Tutorial',
    article: 'Artigo',
    security: 'Segurança',
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
      h(
        'p',
        { style: { fontSize: 14, color: '#1a8917', fontWeight: 600, margin: 0 } },
        typeMap[type] ?? ''
      ),
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
