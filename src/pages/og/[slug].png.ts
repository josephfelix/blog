import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import sharp from 'sharp'

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

function detectMime(buf: Buffer): string {
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp'
  return 'image/png'
}

async function getCoverDataUrl(cover: string | undefined): Promise<string | null> {
  if (!cover) return null
  const relativePath = cover.replace(/^\/blog/, '')
  const filePath = resolve('./public' + relativePath)
  if (!existsSync(filePath)) return null
  let data = readFileSync(filePath)
  let mime = detectMime(data)
  if (mime === 'image/webp') {
    data = await sharp(data).png().toBuffer()
    mime = 'image/png'
  }
  return `data:${mime};base64,${data.toString('base64')}`
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', p => !p.data.draft)
  return posts.map(post => ({
    params: { slug: post.id },
    props: {
      title: post.data.ogTitle ?? post.data.title,
      type: post.data.type,
      cover: post.data.cover,
    },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { title, type, cover } = props as { title: string; type: string; cover?: string }

  const typeMap: Record<string, string> = {
    project: 'PROJETO',
    tutorial: 'TUTORIAL',
    article: 'ARTIGO',
    security: 'SEGURANÇA',
  }

  const coverDataUrl = await getCoverDataUrl(cover)
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '…' : title
  const hasCover = !!coverDataUrl

  const titleFontSize = displayTitle.length > 50 ? 44 : displayTitle.length > 35 ? 52 : 62

  const element = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'Source Serif 4',
        backgroundColor: '#0f172a',
      },
    },
    // left panel — cover image (contained, no crop)
    ...(hasCover
      ? [
          h(
            'div',
            {
              style: {
                flex: '0 0 42%',
                display: 'flex',
                overflow: 'hidden',
              },
            },
            h('img', {
              src: coverDataUrl,
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              },
            })
          ),
        ]
      : []),
    // right panel — title + CTA centered
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '56px 56px',
          flex: '1',
          backgroundColor: '#0f172a',
          gap: '40px',
        },
      },
      h(
        'h1',
        {
          style: {
            fontSize: titleFontSize,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.2,
            margin: 0,
            fontFamily: 'Source Serif 4',
            textAlign: 'center',
          },
        },
        displayTitle
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            backgroundColor: '#e94560',
            padding: '18px 48px',
            borderRadius: '12px',
          },
        },
        h(
          'p',
          { style: { fontSize: 22, color: '#ffffff', margin: 0, fontWeight: 600 } },
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
