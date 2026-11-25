import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve(process.argv[2] ?? "dist");
const manifestPath = resolve(directory, "runtime/publication-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const blockedPaths = new Set(
  (manifest.entries ?? [])
    .filter(entry => !entry.indexable)
    .map(entry => entry.path)
);

for (const path of ["/admin/", "/search/", "/en/search/", "/runtime/"]) {
  blockedPaths.add(path);
}

const sitemapName = (await readdir(directory))
  .filter(name => /^sitemap-\d+\.xml$/.test(name))
  .sort()[0];
if (!sitemapName) {
  throw new Error("Astro did not generate a sitemap shard");
}

const sitemapPath = resolve(directory, sitemapName);
const sitemap = await readFile(sitemapPath, "utf8");
const indexingEnabled =
  process.env.PUBLIC_INDEXING_ENABLED === "true" ||
  process.env.PUBLIC_INDEXING_ENABLED === "1";

const filtered = indexingEnabled
  ? sitemap.replace(/<url>[\s\S]*?<\/url>/g, block => {
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
      if (!loc) return block;
      const path = new URL(loc).pathname;
      return blockedPaths.has(path) ||
        [...blockedPaths].some(
          blocked => blocked.endsWith("/") && path.startsWith(blocked)
        )
        ? ""
        : block;
    })
  : sitemap.replace(/<url>[\s\S]*?<\/url>/g, "");

await writeFile(sitemapPath, filtered);
