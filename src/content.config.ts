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
