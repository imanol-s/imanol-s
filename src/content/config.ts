import {defineCollection, reference, z} from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
    loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/posts' }),
    schema: ({ image }) => z.object({
        author: z.string().optional(),
        publishDate: z.date(),
        updateDate: z.date().optional(),
        title: z.string(),
        relatedPosts: z.array(reference('posts')).optional(),
        tags: z.array(z.string()),
        description: z.string(),
        cover: z.object({
            src: image(),
            alt: z.string().optional(),
        }),
    }),
});

const projects = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        summary: z.string(),
        url: z.string().optional(),
        cover: image(),
        tags: z.array(z.string()),
        ogImage: z.string()
    }),
});

export const collections = {  projects, posts };
