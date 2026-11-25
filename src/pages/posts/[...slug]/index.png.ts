import type { APIRoute } from "astro";
import { type CollectionEntry } from "astro:content";
import { getRoutableEntries } from "@/lib/content/queries";
import { generateOgImageForPost } from "@/utils/generateOgImages";
import { SITE } from "@/config";

export async function getStaticPaths() {
  if (!SITE.dynamicOgImage) {
    return [];
  }

  const posts = (await getRoutableEntries("blog", "zh-CN")).filter(
    post => !post.data.ogImage
  );

  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) => {
  if (!SITE.dynamicOgImage) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const buffer = await generateOgImageForPost(props as CollectionEntry<"blog">);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
