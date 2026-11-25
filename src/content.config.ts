import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SITE } from "@/config";
import {
  BLOG_PATH,
  GALLERY_PATH,
  EDITORIAL_PAGE_PATH,
  TOMBSTONE_PATH,
} from "@/lib/content/locations";
import { isValidTimezone } from "@/lib/content/dates";
import {
  maturityStages,
  publicationKinds,
  relationshipKinds,
} from "@/lib/content/model";
import { publicationStatuses, translationStatuses } from "@/lib/content/status";
import { isSafeRemoteMediaUrl } from "@/utils/media";

const slug = z
  .string()
  .regex(
    /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u,
    "Use a single URL segment with letters, digits or hyphens"
  );
const optionalNonEmptyString = z.preprocess(
  value =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional()
);
const remoteMediaUrl = z
  .string()
  .url()
  .refine(
    isSafeRemoteMediaUrl,
    "Remote publication media must use a safe HTTPS URL"
  );
const localMediaPath = z
  .string()
  .regex(
    /^\/(?!\/).+/,
    "Local publication media must use a site-relative /path"
  );
const publicationImage = <T extends z.ZodType>(imageField: () => T) =>
  z.union([imageField(), remoteMediaUrl, localMediaPath]);
const aliasPath = z
  .string()
  .regex(/^\/.*\/$/, "Use a site-relative path with a trailing slash");
const publication = {
  uid: z.string().trim().min(1),
  slug,
  previousSlugs: z.array(slug).default([]),
  aliases: z.array(aliasPath).default([]),
  translationKey: optionalNonEmptyString,
  status: z.enum(publicationStatuses).default("published"),
  scheduledFor: z.date().optional().nullable(),
  archivedAt: z.date().optional().nullable(),
  expiresAt: z.date().optional().nullable(),
  // Legacy field retained so existing entries and Agent-created content keep
  // building. New content and the CMS use `expiresAt`.
  expireAt: z.date().optional().nullable(),
  redirectTo: z
    .string()
    .refine(
      value => value.startsWith("/") || /^https?:\/\//.test(value),
      "Use an absolute path or an HTTP(S) URL"
    )
    .optional(),
  // Chinese entries treat an omitted value as not-required. English entries
  // must explicitly reach `published` before they become public.
  translationStatus: z.enum(translationStatuses).optional(),
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
  entry.replaceAll("\\", "/").replace(/\.(?:mdx?|ya?ml)$/, "");

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
      // Kept for compatibility with older content. New content uses `status`.
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: publicationImage(image).optional(),
      coverImage: publicationImage(image).optional(),
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
      coverImage: publicationImage(image).optional(),
      tags: z.array(z.string()).default([]),
      media: z
        .array(
          z.object({
            src: publicationImage(image),
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

const tombstones = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml}",
    base: `./${TOMBSTONE_PATH}`,
    generateId: fileId,
  }),
  schema: z.object({
    path: z
      .string()
      .regex(/^\/.*\/$/, "Use a site-relative path with a trailing slash"),
    status: z.enum(["expired", "withdrawn", "deleted"]),
    redirectTo: z
      .string()
      .refine(
        value => value.startsWith("/") || /^https?:\/\//.test(value),
        "Use an absolute path or an HTTP(S) URL"
      )
      .optional(),
    withdrawnAt: z.date().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { blog, galleries, pages, tombstones };
