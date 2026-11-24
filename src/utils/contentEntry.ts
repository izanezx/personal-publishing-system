import type { CollectionEntry } from "astro:content";
import { getPath } from "./getPath";

export type ContentEntry =
  CollectionEntry<"blog"> | CollectionEntry<"galleries">;

const isGalleryEntry = (
  entry: Pick<ContentEntry, "collection">
): entry is CollectionEntry<"galleries"> => entry.collection === "galleries";

export const getGallerySlug = (id: string) =>
  id.replace(/^(?:en|zh-cn)\//, "").replace(/\/index(?:\.(?:md|mdx))?$/, "");

export const getEntryPath = (
  entry: Pick<ContentEntry, "collection" | "id" | "filePath"> & {
    data?: { slug: string };
  }
) => {
  if (entry.data?.slug)
    return `/${isGalleryEntry(entry) ? "galleries" : "posts"}/${entry.data.slug}`;
  return isGalleryEntry(entry)
    ? `/galleries/${getGallerySlug(entry.id)}`
    : getPath(entry.id, entry.filePath);
};

export const getEntryPublishedMs = (entry: ContentEntry) => {
  return new Date(entry.data.pubDatetime).getTime();
};

export function getEntryTransitionName(
  entry: Pick<ContentEntry, "collection" | "id"> & { data?: { uid: string } }
) {
  const id = Array.from(entry.data?.uid ?? entry.id, character =>
    character.codePointAt(0)!.toString(16)
  ).join("-");
  return `entry-${entry.collection}-${id}`;
}
