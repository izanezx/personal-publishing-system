import type { ContentEntry } from "./contentEntry";
import { contentLocale } from "@/i18n/locales";
import {
  effectivePublicationStatus,
  isRoutableStatus,
  isTranslationPublished,
  type PublicationStatusData,
} from "@/lib/content/status";
import { isPreviewContentEnabled } from "@/lib/content/build-mode";

export function isPublished(
  data: PublicationStatusData,
  localeOrNow: "zh-CN" | "en" | number = "zh-CN",
  explicitNow = Date.now()
) {
  const locale = typeof localeOrNow === "number" ? "zh-CN" : localeOrNow;
  const now = typeof localeOrNow === "number" ? localeOrNow : explicitNow;
  const status = effectivePublicationStatus(data, now);
  const previewRoutable =
    isPreviewContentEnabled() && (status === "draft" || status === "scheduled");
  return (
    (isRoutableStatus(status) || previewRoutable) &&
    isTranslationPublished(data, locale)
  );
}

const buildTime = Date.now();

export default function postFilter({ data, id }: ContentEntry) {
  return isPublished(data, id ? contentLocale(id) : "zh-CN", buildTime);
}
