import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import {
  contentLocale,
  localizedPath,
  type Locale,
  type LocaleAlternates,
} from "@/i18n/locales";
import { getEntryPath, type ContentEntry } from "@/utils/contentEntry";
import postFilter from "@/utils/postFilter";
import { type Publication, publicationTimestamp } from "./model";
import {
  previousPath,
  publicationRelations,
  validatePublications,
} from "./relations";

export function adaptPublication(entry: ContentEntry): Publication {
  const locale = contentLocale(entry.id);
  const data = entry.data;
  return {
    uid: data.uid,
    slug: data.slug,
    previousSlugs: data.previousSlugs,
    locale,
    kind: "kind" in data ? data.kind : "gallery",
    translationKey: data.translationKey,
    topics: data.topics,
    stage: data.stage,
    relationships: data.relationships,
    publishedAt: data.pubDatetime,
    updatedAt: "modDatetime" in data ? data.modDatetime : undefined,
    draft: data.draft,
    title: data.title,
    description: data.description,
    path: localizedPath(locale, getEntryPath(entry)),
  };
}

export function getPublicEntries<C extends "blog" | "galleries">(
  collection: C,
  locale?: Locale
): Promise<CollectionEntry<C>[]> {
  if (collection === "galleries" && !SITE.showGalleries)
    return Promise.resolve([]);
  return getCollection(
    collection,
    entry =>
      (!locale || contentLocale(entry.id) === locale) && postFilter(entry)
  );
}

export async function getPublicationFeed(
  locale: Locale,
  sort: "published" | "activity" = "published"
) {
  const [posts, galleries] = await Promise.all([
    getPublicEntries("blog", locale),
    SITE.showGalleriesInIndex ? getPublicEntries("galleries", locale) : [],
  ]);
  return [...posts, ...galleries]
    .map(entry => ({ entry, publication: adaptPublication(entry) }))
    .sort(
      (a, b) =>
        publicationTimestamp(b.publication, sort) -
          publicationTimestamp(a.publication, sort) ||
        a.publication.uid.localeCompare(b.publication.uid)
    )
    .map(({ entry }) => entry);
}

export const getEntryActivityMs = (entry: ContentEntry) =>
  publicationTimestamp(adaptPublication(entry), "activity");

export async function getEntryAlternates(
  entry: ContentEntry
): Promise<LocaleAlternates> {
  const current = adaptPublication(entry);
  if (!current.translationKey) return {};
  const translations = (await getPublicEntries(entry.collection))
    .map(adaptPublication)
    .filter(
      item =>
        item.kind === current.kind &&
        item.translationKey === current.translationKey
    );
  return Object.fromEntries(translations.map(item => [item.locale, item.path]));
}

export async function getPublicationRelations(entry: ContentEntry) {
  const current = adaptPublication(entry);
  const visible = await getPublicationFeed(current.locale);
  return publicationRelations(current, visible.map(adaptPublication));
}

export async function assertUniquePublicationKeys() {
  const entries = [
    ...(await getCollection("blog")),
    ...(await getCollection("galleries")),
  ];
  validatePublications(entries.map(adaptPublication));
}

export async function getPublicationRedirects() {
  await assertUniquePublicationKeys();
  const entries = [
    ...(await getPublicEntries("blog")),
    ...(await getPublicEntries("galleries")),
  ];
  return entries
    .map(adaptPublication)
    .flatMap(entry =>
      entry.previousSlugs.map(
        slug => `${previousPath(entry, slug)} ${entry.path} 301`
      )
    )
    .sort();
}
