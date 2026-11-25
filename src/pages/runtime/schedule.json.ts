import type { APIRoute } from "astro";
import { getScheduleRuntimeManifest } from "@/lib/content/queries";

export const GET: APIRoute = async () =>
  new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      entries: await getScheduleRuntimeManifest(),
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
