import { contentLocale, type Locale } from "@/i18n/locales";
import type { GetStaticPathsOptions } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { assertUniquePublicationKeys } from "./publishing";
import getPostsByTag from "./getPostsByTag";
import getSortedPosts from "./getSortedPosts";
import getUniqueTags from "./getUniqueTags";
import postFilter from "./postFilter";

export async function buildPostStaticPaths(locale: Locale) {
  await assertUniquePublicationKeys();
  const posts = await getCollection(
    "blog",
    ({ id }) => contentLocale(id) === locale
  );
  const sortedPosts = getSortedPosts(posts) as CollectionEntry<"blog">[];
  return sortedPosts.map(post => ({
    params: { slug: post.data.slug },
    props: { post, sortedPosts },
  }));
}

export async function buildGalleryStaticPaths(locale: Locale) {
  if (!SITE.showGalleries) return [];

  const galleries = await getCollection(
    "galleries",
    entry => contentLocale(entry.id) === locale && postFilter(entry)
  );
  return galleries.map(gallery => ({
    params: { gallery: gallery.data.slug },
    props: { entry: gallery },
  }));
}

export async function buildTagStaticPaths(
  locale: Locale,
  paginate: GetStaticPathsOptions["paginate"]
) {
  const [blogPosts, galleryPosts] = await Promise.all([
    getCollection("blog", ({ id }) => contentLocale(id) === locale),
    SITE.showGalleries && SITE.showGalleriesInIndex
      ? getCollection("galleries", ({ id }) => contentLocale(id) === locale)
      : Promise.resolve([]),
  ]);
  const posts = [...blogPosts, ...galleryPosts];
  const tags = getUniqueTags(posts);

  return tags.flatMap(({ tag, tagName }) =>
    paginate(getPostsByTag(posts, tag), {
      params: { tag },
      props: { tagName },
      pageSize: SITE.postPerPage,
    })
  );
}
