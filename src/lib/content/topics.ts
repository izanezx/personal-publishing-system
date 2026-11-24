import type { Locale } from "@/i18n/locales";

export const topics = {
  research: { "zh-CN": "研究与实验", en: "Research and experiments" },
  publishing: { "zh-CN": "个人出版", en: "Publishing" },
  "web-platform": { "zh-CN": "Web 平台", en: "Web platform" },
  "reading-practice": { "zh-CN": "阅读实践", en: "Reading practice" },
  "visual-notes": { "zh-CN": "视觉记录", en: "Visual notes" },
} satisfies Record<string, Record<Locale, string>>;

export function topicLabel(id: string, locale: Locale) {
  return topics[id as keyof typeof topics]?.[locale];
}
