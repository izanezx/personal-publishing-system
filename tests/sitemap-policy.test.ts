import assert from "node:assert/strict";
import test from "node:test";
import { filterSitemapXml } from "../scripts/sitemap-policy.mjs";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://zanezx.com/posts/published/</loc></url>
  <url><loc>https://zanezx.com/posts/archived/</loc></url>
  <url><loc>https://zanezx.com/posts/unlisted/</loc></url>
  <url><loc>https://zanezx.com/admin/</loc></url>
  <url><loc>https://zanezx.com/search/</loc></url>
</urlset>`;

test("indexed sitemap keeps only searchable publication paths", () => {
  const output = filterSitemapXml(sitemap, {
    blockedPaths: new Set([
      "/posts/archived/",
      "/posts/unlisted/",
      "/admin/",
      "/search/",
    ]),
    indexingEnabled: true,
  });
  assert.match(output, /posts\/published/);
  assert.doesNotMatch(output, /posts\/archived|posts\/unlisted|admin|search/);
});

test("disabled public indexing removes every sitemap URL", () => {
  const output = filterSitemapXml(sitemap, {
    blockedPaths: new Set(),
    indexingEnabled: false,
  });
  assert.doesNotMatch(output, /<url>/);
});
