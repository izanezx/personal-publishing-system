import type { APIRoute } from "astro";
import { isPublicIndexingEnabled } from "@/lib/indexing";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ enabled: isPublicIndexingEnabled() }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
