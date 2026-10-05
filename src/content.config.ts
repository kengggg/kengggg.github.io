import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blogCollection = defineCollection({
  // The glob loader uses each post's explicit frontmatter slug as its entry ID.
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['th', 'en']),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    featured_image: image().optional(),
    excerpt: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
