import {defineCollection, reference, z} from 'astro:content';
import { glob } from 'astro/loaders';
import { techRegistry } from '../data/techRegistry';

const validTechIds = new Set<string>(techRegistry.map((t) => t.id));
const techTag = z.string().transform((s) => {
    const normalized = s.trim().toLowerCase();
    if (!validTechIds.has(normalized)) {
        throw new Error(`Unknown tech tag "${s}". Valid: ${[...validTechIds].join(', ')}`);
    }
    return normalized;
});

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

const projects = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        summary: z.string(),
        url: z.string().optional(),
        cover: image(),
        tags: z.array(techTag),
        keywords: z.array(z.string()).optional(),
        ogImage: z.string()
    }),
});

export const collections = {  projects, posts };