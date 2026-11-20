import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
export const GALLERY_PATH = "src/data/galleries";

// Astro's glob loader otherwise uses frontmatter slug as the internal ID.
const fileId = ({ entry }: { entry: string }) =>
  entry.replaceAll("\\", "/").replace(/\.mdx?$/, "");

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
    generateId: fileId,
  }),
  schema: ({ image }) =>
    z.object({
      uid: z.string().trim().min(1),
      slug: z.string().regex(/^[\p{L}\p{N}]+(?:[-][\p{L}\p{N}]+)*$/u),
      translationKey: z.string().trim().min(1).optional(),
      kind: z.enum(["article", "note", "project"]).default("article"),
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      coverImage: image().optional(),
      description: z.string(),
      canonicalURL: z
        .url()
        .refine(url => /^https?:\/\//.test(url))
        .optional(),
      hideToc: z.boolean().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z
        .string()
        .refine(tz => {
          try {
            new Intl.DateTimeFormat("en", { timeZone: tz });
            return true;
          } catch {
            return false;
          }
        }, "Invalid IANA time zone")
        .optional(),
    }),
});

const galleries = defineCollection({
  loader: glob({
    pattern: "**/index.{md,mdx}",
    base: `./${GALLERY_PATH}`,
    generateId: fileId,
  }),
  schema: ({ image }) =>
    z.object({
      uid: z.string().trim().min(1),
      slug: z.string().regex(/^[\p{L}\p{N}]+(?:[-][\p{L}\p{N}]+)*$/u),
      translationKey: z.string().trim().min(1).optional(),
      title: z.string(),
      description: z.string(),
      pubDatetime: z.date(),
      draft: z.boolean().optional(),
      coverImage: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog, galleries };
