import type { Locale } from "@/i18n/locales";
import type { PublicationStatus, TranslationStatus } from "./status";

export const publicationKinds = [
  "article",
  "note",
  "project",
  "resource",
  "pattern",
  "link",
  "quote",
] as const;
export const maturityStages = ["seedling", "budding", "evergreen"] as const;
export const relationshipKinds = ["related", "evolvedFrom"] as const;
export type Maturity = (typeof maturityStages)[number];
export type PublicationKind = (typeof publicationKinds)[number] | "gallery";

export interface Relationship {
  kind: (typeof relationshipKinds)[number];
  uid: string;
}

export interface Publication {
  uid: string;
  slug: string;
  previousSlugs: readonly string[];
  aliases: readonly string[];
  locale: Locale;
  kind: PublicationKind;
  translationKey?: string;
  topics: readonly string[];
  stage: Maturity;
  relationships: readonly Relationship[];
  publishedAt: Date;
  updatedAt?: Date | null;
  draft?: boolean;
  status: PublicationStatus;
  translationStatus: TranslationStatus;
  scheduledFor?: Date | null;
  archivedAt?: Date | null;
  expiresAt?: Date | null;
  redirectTo?: string;
  title: string;
  description: string;
  path: string;
}

export function publicationTimestamp(
  entry: Publication,
  sort: "published" | "activity"
) {
  const publishedAt = entry.publishedAt.getTime();
  return sort === "published"
    ? publishedAt
    : Math.max(publishedAt, entry.updatedAt?.getTime() ?? publishedAt);
}
