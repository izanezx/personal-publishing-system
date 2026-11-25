import { findGoneMatch, type GoneManifestEntry } from "@/lib/content/runtime";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

let goneEntries: Promise<GoneManifestEntry[]> | undefined;
let indexingEnabled: Promise<boolean> | undefined;

function loadGoneEntries(
  request: Request,
  env: Env
): Promise<GoneManifestEntry[]> {
  goneEntries ??= env.ASSETS.fetch(
    new Request(new URL("/runtime/gone.json", request.url))
  )
    .then(response => (response.ok ? response.json() : { entries: [] }))
    .then(
      (manifest: { entries?: GoneManifestEntry[] }) => manifest.entries ?? []
    )
    .catch(() => [] as GoneManifestEntry[]);
  return goneEntries;
}

function loadIndexingEnabled(request: Request, env: Env): Promise<boolean> {
  indexingEnabled ??= env.ASSETS.fetch(
    new Request(new URL("/runtime/indexing.json", request.url))
  )
    .then(response => (response.ok ? response.json() : { enabled: false }))
    .then((manifest: { enabled?: boolean }) => manifest.enabled === true)
    .catch(() => false);
  return indexingEnabled;
}

async function serveAsset(request: Request, env: Env) {
  const response = await env.ASSETS.fetch(request);
  if (await loadIndexingEnabled(request, env)) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function goneResponse(request: Request) {
  const body =
    request.method === "HEAD"
      ? null
      : `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="robots" content="noindex"><title>内容已下线</title><main><h1>410</h1><p>这条内容已永久下线。</p><p><a href="/">返回首页</a></p></main></html>`;
  return new Response(body, {
    status: 410,
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return serveAsset(request, env);
    }

    const url = new URL(request.url);
    const match = findGoneMatch(
      url.pathname,
      await loadGoneEntries(request, env)
    );
    if (!match) return serveAsset(request, env);
    if (match.status === 410) return goneResponse(request);

    const location = match.redirectTo?.startsWith("/")
      ? new URL(match.redirectTo, url.origin).href
      : match.redirectTo;
    return new Response(null, {
      status: 301,
      headers: {
        Location: location ?? "/",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};
