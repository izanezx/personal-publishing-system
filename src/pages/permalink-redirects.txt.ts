import type { APIRoute } from "astro";
import { getPublicationRedirects } from "@/lib/content/queries";

export const GET: APIRoute = async () =>
  new Response((await getPublicationRedirects()).join("\n") + "\n", {
    headers: { "Content-Type": "text/plain" },
  });
