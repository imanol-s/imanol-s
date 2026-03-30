import {defineCollection, reference} from 'astro:content';
import {z} from 'astro/zod';
import { glob } from 'astro/loaders';
import { techTagSchema } from './data/techRegistry';

// Post tags are free-form strings — intentionally NOT validated against
// techRegistry, unlike project tags below.
const posts = defineCollection({
    loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/posts' }),
    schema: ({ image }) => z.object({
        author: z.string().optional(),
        publishDate: z.date(),
        updateDate: z.date().optional(),
        title: z.string(),
        relatedPosts: z.array(reference('posts')).optional(),
        tags: z.array(z.string()),
        keywords: z.array(z.string()).optional(),
        description: z.string(),
        cover: z.object({
            src: image(),
            alt: z.string().optional(),
        }),
    }),
});

// Project tags use techTagSchema: validated against techRegistry at build time.
// Unknown tags fail `astro check`. Use `keywords` for free-form topic strings.
const projects = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        summary: z.string(),
        url: z.string().optional(),
        cover: image(),
        tags: z.array(techTagSchema),
        keywords: z.array(z.string()).optional(),
        ogImage: z.string()
    }),
});

export const collections = {  projects, posts };
