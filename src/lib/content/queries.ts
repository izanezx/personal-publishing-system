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
  validateTombstones,
} from "./relations";
import {
  effectivePublicationStatus,
  effectiveTranslationStatus,
  isSearchablePublication,
  isTranslationPublished,
} from "./status";

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
    status: effectivePublicationStatus({
      status: data.status,
      draft: data.draft,
      pubDatetime: data.pubDatetime,
      scheduledFor: data.scheduledFor,
      expireAt: data.expireAt,
      translationStatus: data.translationStatus,
    }),
    translationStatus: effectiveTranslationStatus(data, locale),
    scheduledFor: data.scheduledFor,
    expireAt: data.expireAt,
    redirectTo: data.redirectTo,
    title: data.title,
    description: data.description,
    path: localizedPath(locale, getEntryPath(entry)),
  };
}

export function getRoutableEntries<C extends "blog" | "galleries">(
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

export async function getPublicEntries<C extends "blog" | "galleries">(
  collection: C,
  locale?: Locale,
  options: { includeArchived?: boolean } = {}
): Promise<CollectionEntry<C>[]> {
  const entries = await getRoutableEntries(collection, locale);
  return entries.filter(entry => {
    const currentLocale = contentLocale(entry.id);
    const publication = adaptPublication(entry);
    return (
      isTranslationPublished(entry.data, currentLocale) &&
      (publication.status === "published" ||
        (options.includeArchived && publication.status === "archived"))
    );
  });
}

export async function getPublicationFeed(
  locale: Locale,
  sort: "published" | "activity" = "published",
  options: { includeArchived?: boolean } = {}
) {
  const [posts, galleries] = await Promise.all([
    getPublicEntries("blog", locale, options),
    SITE.showGalleriesInIndex
      ? getPublicEntries("galleries", locale, options)
      : [],
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
  const translations = (await getRoutableEntries(entry.collection))
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
  const publications = entries.map(adaptPublication);
  const tombstones = await getCollection("tombstones");
  validatePublications(publications);
  validateTombstones(publications, tombstones);
}

export async function getPublicationRedirects() {
  await assertUniquePublicationKeys();
  const entries = [
    ...(await getRoutableEntries("blog")),
    ...(await getRoutableEntries("galleries")),
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

export async function getPublicationRuntimeManifest() {
  await assertUniquePublicationKeys();
  const entries = [
    ...(await getRoutableEntries("blog")),
    ...(await getRoutableEntries("galleries")),
  ];

  return entries
    .map(entry => {
      const locale = contentLocale(entry.id);
      return {
        path: adaptPublication(entry).path,
        indexable: isSearchablePublication(entry.data, locale),
        searchable: isSearchablePublication(entry.data, locale),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function getGonePublicationManifest() {
  await assertUniquePublicationKeys();
  const allPublications = [
    ...(await getCollection("blog")),
    ...(await getCollection("galleries")),
  ];
  const contentEntries = allPublications
    .map(entry => {
      const publication = adaptPublication(entry);
      return { entry, publication };
    })
    .filter(
      ({ entry, publication }) =>
        publication.status === "expired" ||
        publication.status === "withdrawn" ||
        Boolean(entry.data.expireAt)
    )
    .map(({ entry, publication }) => {
      const immediate =
        entry.data.status === "expired" ||
        entry.data.status === "withdrawn" ||
        entry.data.draft === true;
      return {
        path: publication.path,
        status: publication.status === "withdrawn" ? "withdrawn" : "expired",
        redirectTo: publication.redirectTo,
        ...(immediate || !publication.expireAt
          ? {}
          : { effectiveAt: publication.expireAt.toISOString() }),
      };
    });
  const tombstones = (await getCollection("tombstones")).map(entry => ({
    path: entry.data.path,
    status: entry.data.status,
    redirectTo: entry.data.redirectTo,
  }));

  return [...contentEntries, ...tombstones]
    .flatMap(entry => [
      entry,
      {
        ...entry,
        path: `${entry.path.replace(/\/$/, "")}/index.png`,
      },
    ])
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function getScheduleRuntimeManifest(now = new Date()) {
  await assertUniquePublicationKeys();
  const entries = [
    ...(await getCollection("blog")),
    ...(await getCollection("galleries")),
  ];

  return entries
    .map(entry => {
      const locale = contentLocale(entry.id);
      const publication = adaptPublication(entry);
      const activationAt =
        entry.data.scheduledFor ?? entry.data.pubDatetime ?? undefined;
      const activateAt =
        activationAt && activationAt.getTime() > now.getTime()
          ? activationAt.toISOString()
          : undefined;
      const expireAt =
        publication.expireAt &&
        publication.expireAt.getTime() > now.getTime() &&
        entry.data.status !== "expired" &&
        entry.data.status !== "withdrawn"
          ? publication.expireAt.toISOString()
          : undefined;

      return {
        path: publication.path,
        ...(isTranslationPublished(entry.data, locale) && activateAt
          ? { activateAt }
          : {}),
        ...(expireAt ? { expireAt } : {}),
      };
    })
    .filter(entry => entry.activateAt || entry.expireAt)
    .sort((a, b) => a.path.localeCompare(b.path));
}
