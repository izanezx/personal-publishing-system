import type { APIRoute } from "astro";
import { isPublicIndexingEnabled } from "@/lib/indexing";
import { withBase } from "@/lib/site-paths";

export const GET: APIRoute = ({ site }) => {
  const indexing = isPublicIndexingEnabled();
  const body = indexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase("/sitemap-index.xml"), site)}\n`
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
