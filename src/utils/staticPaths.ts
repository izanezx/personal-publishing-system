import { type Locale } from "@/i18n/locales";
import type { GetStaticPathsOptions } from "astro";
import { SITE } from "@/config";
import {
  assertUniquePublicationKeys,
  getPublicationFeed,
  getRoutableEntries,
} from "@/lib/content/queries";
import getPostsByTag from "./getPostsByTag";
import getUniqueTags from "./getUniqueTags";

export async function buildPostStaticPaths(locale: Locale) {
  await assertUniquePublicationKeys();
  const sortedPosts = (await getRoutableEntries("blog", locale)).sort(
    (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
  );
  return sortedPosts.map(post => ({
    params: { slug: post.data.slug },
    props: { post, sortedPosts },
  }));
}

export async function buildGalleryStaticPaths(locale: Locale) {
  if (!SITE.showGalleries) return [];

  const galleries = await getRoutableEntries("galleries", locale);
  return galleries.map(gallery => ({
    params: { gallery: gallery.data.slug },
    props: { entry: gallery },
  }));
}

export async function buildTagStaticPaths(
  locale: Locale,
  paginate: GetStaticPathsOptions["paginate"]
) {
  const posts = await getPublicationFeed(locale);
  const tags = getUniqueTags(posts);

  return tags.flatMap(({ tag, tagName }) =>
    paginate(getPostsByTag(posts, tag), {
      params: { tag },
      props: { tagName },
      pageSize: SITE.postPerPage,
    })
  );
}
