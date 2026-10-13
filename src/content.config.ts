import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 文章放在 src/content/blog/ 底下，底線開頭的檔案（例如 _template.md）不會被讀取
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
