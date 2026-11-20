import { getCollection } from "astro:content";
import { SITE } from "@/config";
import {
  contentLocale,
  localizedPath,
  type Locale,
  type LocaleAlternates,
} from "@/i18n/locales";
import {
  getEntryPath,
  getEntryPublishedMs,
  type ContentEntry,
} from "./contentEntry";
import postFilter from "./postFilter";

export async function getPublicationFeed(
  locale: Locale,
  sort: "published" | "activity" = "published"
) {
  const [posts, galleries] = await Promise.all([
    getCollection(
      "blog",
      entry => contentLocale(entry.id) === locale && postFilter(entry)
    ),
    SITE.showGalleries && SITE.showGalleriesInIndex
      ? getCollection(
          "galleries",
          entry => contentLocale(entry.id) === locale && postFilter(entry)
        )
      : [],
  ]);
  const byDate = sort === "activity" ? getEntryActivityMs : getEntryPublishedMs;
  return [...posts, ...galleries].sort(
    (a, b) => byDate(b) - byDate(a) || a.id.localeCompare(b.id)
  );
}

export function getEntryActivityMs(entry: ContentEntry) {
  const published = getEntryPublishedMs(entry);
  const modified =
    "modDatetime" in entry.data ? entry.data.modDatetime?.getTime() : undefined;
  return Math.max(published, modified ?? published);
}

export async function getEntryAlternates(
  entry: ContentEntry
): Promise<LocaleAlternates> {
  if (!entry.data.translationKey) return {};
  const translations = await getCollection(
    entry.collection,
    candidate =>
      candidate.data.translationKey === entry.data.translationKey &&
      postFilter(candidate)
  );
  return Object.fromEntries(
    translations.map(candidate => {
      const locale = contentLocale(candidate.id);
      return [locale, localizedPath(locale, getEntryPath(candidate))];
    })
  );
}

export async function assertUniquePublicationKeys() {
  const entries = [
    ...(await getCollection("blog")),
    ...(await getCollection("galleries")),
  ];
  const identities = new Set<string>();
  const paths = new Set<string>();
  const translations = new Set<string>();
  for (const entry of entries) {
    const locale = contentLocale(entry.id);
    const href = localizedPath(locale, getEntryPath(entry));
    const translation = JSON.stringify([
      entry.collection,
      locale,
      entry.data.translationKey,
    ]);
    if (identities.has(entry.data.uid))
      throw new Error(`Duplicate publication UID: ${entry.data.uid}`);
    if (paths.has(href)) throw new Error(`Duplicate publication path: ${href}`);
    if (entry.data.translationKey && translations.has(translation)) {
      throw new Error(
        `Duplicate translation key ${entry.data.translationKey} for ${locale} in ${entry.collection}`
      );
    }
    identities.add(entry.data.uid);
    paths.add(href);
    if (entry.data.translationKey) translations.add(translation);
  }
}
