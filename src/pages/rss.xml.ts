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
