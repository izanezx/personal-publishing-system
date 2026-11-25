import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { filterSitemapXml } from "./sitemap-policy.mjs";

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

const sitemapNames = (await readdir(directory))
  .filter(name => /^sitemap-\d+\.xml$/.test(name))
  .sort();
if (sitemapNames.length === 0) {
  throw new Error("Astro did not generate a sitemap shard");
}

const indexingEnabled =
  process.env.PUBLIC_INDEXING_ENABLED === "true" ||
  process.env.PUBLIC_INDEXING_ENABLED === "1";

for (const sitemapName of sitemapNames) {
  const sitemapPath = resolve(directory, sitemapName);
  const sitemap = await readFile(sitemapPath, "utf8");
  const filtered = filterSitemapXml(sitemap, {
    blockedPaths,
    indexingEnabled,
  });
  await writeFile(sitemapPath, filtered);
}
