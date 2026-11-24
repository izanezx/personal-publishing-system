import { isValidTimezone } from "@/lib/content/dates";

interface SiteSettings {
  website: string;
  title: string;
  desc: string;
  author: string;
  timezone: string;
  postPerIndex: number;
  postPerPage: number;
  showArchives: boolean;
  showGalleries: boolean;
  showGalleriesInIndex: boolean;
}

const defaults: SiteSettings = {
  website: "https://zanezx.com/",
  title: "zanezx",
  desc: "",
  author: "",
  timezone: "Asia/Shanghai",
  postPerIndex: 6,
  postPerPage: 12,
  showArchives: true,
  showGalleries: true,
  showGalleriesInIndex: true,
};

export function resolveSiteSettings(
  overrides: Partial<SiteSettings> = {}
): SiteSettings {
  const settings = { ...defaults, ...overrides };
  const url = new URL(settings.website);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("Site website must be an HTTP(S) origin");
  }
  if (!settings.title.trim()) throw new Error("Site title must contain text");
  if (!isValidTimezone(settings.timezone))
    throw new Error("Invalid site time zone: " + settings.timezone);
  for (const limit of [settings.postPerIndex, settings.postPerPage]) {
    if (!Number.isSafeInteger(limit) || limit < 1)
      throw new Error("Publication limits must be positive integers");
  }
  return { ...settings, website: url.href };
}
