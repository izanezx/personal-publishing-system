import type { ContentEntry } from "./contentEntry";
import { contentLocale } from "@/i18n/locales";
import {
  effectivePublicationStatus,
  isRoutableStatus,
  isTranslationPublished,
  type PublicationStatusData,
} from "@/lib/content/status";

export function isPublished(
  data: PublicationStatusData,
  localeOrNow: "zh-CN" | "en" | number = "zh-CN",
  explicitNow = Date.now()
) {
  const locale = typeof localeOrNow === "number" ? "zh-CN" : localeOrNow;
  const now = typeof localeOrNow === "number" ? localeOrNow : explicitNow;
  return (
    isRoutableStatus(effectivePublicationStatus(data, now)) &&
    isTranslationPublished(data, locale)
  );
}

const buildTime = Date.now();

export default function postFilter({ data, id }: ContentEntry) {
  return isPublished(data, id ? contentLocale(id) : "zh-CN", buildTime);
}
