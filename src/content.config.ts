import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const portfolio = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/portfolio" }),
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        image: image(),
        github: z.string().optional(),
        url: z.string().optional(),
        tags: z.array(z.string()),
        lang: z.string(),
    }),
});

const resume = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/resume" }),
    schema: ({ image }) => z.object({
        name: z.string(),
        lang: z.string(),
        image: image(),
        quickInformation: z.array(z.string()),
        professionalProfile: z.object({
            title: z.string(),
            content: z.array(z.string()),
        }),
        skills: z.object({
            title: z.string(),
            content: z.array(z.record(z.array(z.string())))
        }),
        education: z.object({
            title: z.string(),
            content: z.array(z.string()),
        }),
        languages: z.object({
            title: z.string(),
            content: z.array(z.object({
                language: z.string(),
                level: z.string(),
            })),
        }),
        additionalInfo: z.object({
            title: z.string(),
            content: z.array(z.string()),
        }),
        projects: z.object({
            title: z.string(),
            content: z.array(z.string()),
        }),
    }),
});

export const collections = { portfolio, resume };
