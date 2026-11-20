import rss from "@astrojs/rss";
import { localizedPath, type Locale } from "@/i18n/locales";
import { getEntryPath, getEntryPublishedMs } from "@/utils/contentEntry";
import { getEntryActivityMs, getPublicationFeed } from "@/utils/publishing";
import { SITE } from "@/config";

export async function generateLocaleRss(
  locale: Locale,
  sort: "published" | "activity" = "published"
) {
  const entries = await getPublicationFeed(locale, sort);
  const timestamp =
    sort === "activity" ? getEntryActivityMs : getEntryPublishedMs;
  return rss({
    title: SITE.title,
    description: SITE.desc || SITE.title,
    site: SITE.website,
    items: entries.map(entry => ({
      link: localizedPath(locale, getEntryPath(entry)),
      title: entry.data.title,
      description: entry.data.description,
      pubDate: new Date(timestamp(entry)),
    })),
  });
}

export const GET = () => generateLocaleRss("zh-CN");
