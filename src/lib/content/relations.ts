import type { Publication } from "./model";
import { topicLabel } from "./topics";

interface Tombstone {
  data: {
    path: string;
    redirectTo?: string;
  };
}

export function validatePublications(entries: readonly Publication[]) {
  const byUid = new Map<string, Publication>();
  const paths = new Set<string>();
  const translations = new Set<string>();
  const redirects = new Set<string>();

  for (const entry of entries) {
    const translation = JSON.stringify([
      entry.locale,
      entry.kind,
      entry.translationKey,
    ]);
    if (byUid.has(entry.uid))
      throw new Error(`Duplicate publication UID: ${entry.uid}`);
    if (paths.has(entry.path))
      throw new Error(`Duplicate publication path: ${entry.path}`);
    if (entry.translationKey && translations.has(translation)) {
      throw new Error(
        `Duplicate translation key: ${entry.translationKey} (${entry.locale}, ${entry.kind})`
      );
    }
    byUid.set(entry.uid, entry);
    paths.add(entry.path);
    if (entry.translationKey) translations.add(translation);
  }

  for (const entry of entries) {
    for (const topic of entry.topics) {
      if (!topicLabel(topic, entry.locale))
        throw new Error(`Unknown topic "${topic}" on ${entry.uid}`);
    }
    const seen = new Set<string>();
    for (const link of entry.relationships) {
      if (link.uid === entry.uid)
        throw new Error(`Publication ${entry.uid} links to itself`);
      if (!byUid.has(link.uid))
        throw new Error(`Unknown related UID "${link.uid}" on ${entry.uid}`);
      const key = JSON.stringify([link.kind, link.uid]);
      if (seen.has(key))
        throw new Error(
          `Duplicate relationship to ${link.uid} on ${entry.uid}`
        );
      seen.add(key);
    }
    for (const slug of entry.previousSlugs) {
      const path = previousPath(entry, slug);
      if (paths.has(path) || redirects.has(path))
        throw new Error(`Conflicting redirect from ${path}`);
      redirects.add(path);
    }
    for (const alias of entry.aliases) {
      if (!alias.startsWith("/") || !alias.endsWith("/")) {
        throw new Error(`Invalid alias path on ${entry.uid}: ${alias}`);
      }
      if (alias === entry.path) {
        throw new Error(`Publication ${entry.uid} aliases its current path`);
      }
      if (paths.has(alias) || redirects.has(alias))
        throw new Error(`Conflicting redirect from ${alias}`);
      redirects.add(alias);
    }
  }
}

export function validateTombstones(
  entries: readonly Publication[],
  tombstones: readonly Tombstone[]
) {
  const livePaths = new Set(entries.map(entry => entry.path));
  const redirectPaths = new Set(
    entries.flatMap(entry => [
      ...entry.previousSlugs.map(slug => previousPath(entry, slug)),
      ...entry.aliases,
    ])
  );
  const tombstonePaths = new Set<string>();
  for (const tombstone of tombstones) {
    const path = tombstone.data.path;
    if (livePaths.has(path))
      throw new Error(`Tombstone conflicts with a live publication: ${path}`);
    if (redirectPaths.has(path))
      throw new Error(`Tombstone conflicts with a redirect: ${path}`);
    if (tombstonePaths.has(path))
      throw new Error(`Duplicate tombstone path: ${path}`);
    tombstonePaths.add(path);
  }
}

export function previousPath(
  entry: Pick<Publication, "path" | "slug">,
  slug: string
) {
  return `${entry.path.slice(0, -(entry.slug.length + 1))}${slug}/`;
}

export function publicationRelations(
  entry: Publication,
  visible: readonly Publication[]
) {
  const byUid = new Map(visible.map(item => [item.uid, item]));
  return {
    outgoing: entry.relationships.flatMap(link => {
      const target = byUid.get(link.uid);
      return target ? [{ kind: link.kind, target }] : [];
    }),
    incoming: visible.filter(item =>
      item.relationships.some(link => link.uid === entry.uid)
    ),
  };
}
