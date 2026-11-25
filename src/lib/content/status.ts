import type { Locale } from "@/i18n/locales";

export const publicationStatuses = [
  "draft",
  "scheduled",
  "published",
  "unlisted",
  "archived",
  "expired",
  "withdrawn",
] as const;

export const translationStatuses = [
  "not-required",
  "pending",
  "ai-draft",
  "reviewed",
  "published",
] as const;

export type PublicationStatus = (typeof publicationStatuses)[number];
export type TranslationStatus = (typeof translationStatuses)[number];

export interface PublicationStatusData {
  status?: PublicationStatus;
  draft?: boolean;
  translationStatus?: TranslationStatus;
  pubDatetime: Date | string;
  scheduledFor?: Date | string | null;
  expireAt?: Date | string | null;
  redirectTo?: string;
}

const timestamp = (value: Date | string | null | undefined) =>
  value ? new Date(value).getTime() : undefined;

export function effectivePublicationStatus(
  data: PublicationStatusData,
  now = Date.now()
): PublicationStatus {
  if (data.draft) return "draft";
  if (data.status === "draft" || data.status === "withdrawn") {
    return data.status;
  }
  if (data.status === "expired") return "expired";

  const startsAt = timestamp(data.scheduledFor) ?? timestamp(data.pubDatetime);
  if (startsAt !== undefined && startsAt > now) return "scheduled";

  const expiresAt = timestamp(data.expireAt);
  if (expiresAt !== undefined && expiresAt <= now) return "expired";

  if (data.status === "scheduled") return "published";
  if (data.status === "archived") return "archived";
  if (data.status === "unlisted") return "unlisted";
  return "published";
}

export function isTranslationPublished(
  data: PublicationStatusData,
  locale: Locale
) {
  if (locale !== "en") return true;
  const status = data.translationStatus ?? "pending";
  return status === "not-required" || status === "published";
}

export function effectiveTranslationStatus(
  data: Pick<PublicationStatusData, "translationStatus">,
  locale: Locale
): TranslationStatus {
  if (locale !== "en") return "not-required";
  return data.translationStatus ?? "pending";
}

export function isRoutableStatus(status: PublicationStatus) {
  return (
    status === "published" || status === "unlisted" || status === "archived"
  );
}

export function isListedStatus(status: PublicationStatus) {
  return status === "published" || status === "archived";
}

export function isGoneStatus(status: PublicationStatus) {
  return status === "expired" || status === "withdrawn";
}

export function isRoutablePublication(
  data: PublicationStatusData,
  locale: Locale,
  now = Date.now()
) {
  return (
    isRoutableStatus(effectivePublicationStatus(data, now)) &&
    isTranslationPublished(data, locale)
  );
}

export function isListedPublication(
  data: PublicationStatusData,
  locale: Locale,
  now = Date.now(),
  includeArchived = false
) {
  const status = effectivePublicationStatus(data, now);
  return (
    isTranslationPublished(data, locale) &&
    (status === "published" || (includeArchived && status === "archived"))
  );
}

export function isSearchablePublication(
  data: PublicationStatusData,
  locale: Locale,
  now = Date.now()
) {
  const status = effectivePublicationStatus(data, now);
  return (
    isTranslationPublished(data, locale) &&
    (status === "published" || status === "archived")
  );
}
