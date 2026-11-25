#!/usr/bin/env node

import assert from "node:assert/strict";

const index = process.argv.indexOf("--base-url");
const baseUrl = (
  index >= 0 ? process.argv[index + 1] : process.env.SMOKE_BASE_URL
)?.replace(/\/$/, "");
const expectIndex =
  process.argv.includes("--expect-index") ||
  process.env.PUBLIC_INDEXING_ENABLED === "true" ||
  process.env.PUBLIC_INDEXING_ENABLED === "1";
const retries = Number(process.env.SMOKE_RETRIES ?? 0);

if (!baseUrl) {
  throw new Error("Provide --base-url or SMOKE_BASE_URL");
}

if (retries > 0) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        new URL("/runtime/indexing.json", `${baseUrl}/`),
        {
          headers: { "Cache-Control": "no-cache" },
        }
      );
      if (response.ok) break;
      lastError = new Error(`Deployment returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt === retries) throw lastError;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

const request = async (pathname, init = {}) => {
  const response = await fetch(new URL(pathname, `${baseUrl}/`), {
    ...init,
    signal: AbortSignal.timeout(10_000),
    redirect: "manual",
    headers: {
      "Cache-Control": "no-cache",
      ...init.headers,
    },
  });
  return response;
};

const expectStatus = async (pathname, status) => {
  const response = await request(pathname);
  assert.equal(
    response.status,
    status,
    `${pathname} returned ${response.status}, expected ${status}`
  );
  return response;
};

const home = await expectStatus("/", 200);
const homeHeaders = home.headers;
const indexing = await (
  await expectStatus("/runtime/indexing.json", 200)
).json();
assert.equal(indexing.enabled, expectIndex, "Runtime indexing mode differs");

if (expectIndex) {
  assert.equal(
    homeHeaders.get("x-robots-tag"),
    null,
    "Indexed home must not send X-Robots-Tag"
  );
} else {
  assert.equal(
    homeHeaders.get("x-robots-tag"),
    "noindex, nofollow",
    "Preview home must remain noindex"
  );
}

for (const pathname of [
  "/en/",
  "/posts/publishing-baseline/",
  "/en/posts/publishing-baseline/",
  "/search/",
  "/en/search/",
  "/rss.xml",
  "/en/rss.xml",
  "/sitemap-index.xml",
  "/runtime/schedule.json",
  "/runtime/publication-manifest.json",
]) {
  await expectStatus(pathname, 200);
}

await expectStatus("/admin/", 200);
await expectStatus("/__missing-smoke-fixture__/", 404);
await expectStatus("/en/posts/translation-pending-fixture/", 404);
await expectStatus("/en/posts/expired-example/", 410);

const retired = await expectStatus("/posts/retired-example/", 301);
assert.equal(
  new URL(retired.headers.get("location"), baseUrl).pathname,
  "/posts/publishing-baseline/"
);

const robots = await (await expectStatus("/robots.txt", 200)).text();
assert.equal(
  /Sitemap:/i.test(robots),
  expectIndex,
  "robots.txt indexing mode differs"
);
assert.equal(
  /Disallow:\s*\/$/m.test(robots),
  !expectIndex,
  "robots.txt must disallow indexing while preview mode is active"
);

process.stdout.write(
  JSON.stringify({
    baseUrl,
    indexing: expectIndex ? "enabled" : "disabled",
    routes: 12,
    redirects: 1,
    gone: 1,
    result: "pass",
  }) + "\n"
);
