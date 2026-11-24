import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import {
  BLOG_PATH,
  GALLERY_PATH,
  EDITORIAL_PAGE_PATH,
} from "@/lib/content/locations";
import { isValidTimezone } from "@/lib/content/dates";
import {
  maturityStages,
  publicationKinds,
  relationshipKinds,
} from "@/lib/content/model";

const slug = z
  .string()
  .regex(
    /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u,
    "Use a single URL segment with letters, digits or hyphens"
  );
const publication = {
  uid: z.string().trim().min(1),
  slug,
  previousSlugs: z.array(slug).default([]),
  translationKey: z.string().trim().min(1).optional(),
  topics: z.array(slug).default([]),
  stage: z.enum(maturityStages).default("seedling"),
  relationships: z
    .array(
      z.object({
        kind: z.enum(relationshipKinds),
        uid: z.string().trim().min(1),
      })
    )
    .default([]),
};

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
      ...publication,
      kind: z.enum(publicationKinds).default("article"),
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
        .refine(isValidTimezone, "Invalid IANA time zone")
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
      ...publication,
      title: z.string(),
      description: z.string(),
      pubDatetime: z.date(),
      draft: z.boolean().optional(),
      coverImage: image().optional(),
      tags: z.array(z.string()).default([]),
      media: z
        .array(
          z.object({
            src: image(),
            alt: z.string().trim().min(1),
            credit: z.string().trim().min(1).optional(),
            license: z.string().trim().min(1).optional(),
            source: z
              .url()
              .refine(url => /^https?:\/\//.test(url))
              .optional(),
          })
        )
        .default([]),
    }),
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/{about,now}.{md,mdx}",
    base: `./${EDITORIAL_PAGE_PATH}`,
    generateId: fileId,
  }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
  }),
});

export const collections = { blog, galleries, pages };
