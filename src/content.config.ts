import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts are MDX files in src/content/blog; the file name is the URL slug.
const blog = defineCollection({
  loader: glob({ base: "src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
