#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const directory = resolve(process.argv[2] ?? "dist");
const allowedOrigins = new Set([
  new URL(process.env.PUBLIC_SITE_ORIGIN ?? "https://zanezx.com").origin,
  new URL(process.env.PUBLIC_MEDIA_ORIGIN ?? "https://media.zanezx.com").origin,
]);

const attribute = (tag, name) => {
  const pattern = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const match = pattern.exec(tag);
  return match?.[1] ?? match?.[2] ?? match?.[3];
};

const assertAllowed = (value, file) => {
  const candidate = value.trim().split(/\s+/)[0];
  if (
    !candidate ||
    candidate.startsWith("/") ||
    candidate.startsWith("./") ||
    candidate.startsWith("../") ||
    candidate.startsWith("#") ||
    /^(?:data|blob):/i.test(candidate)
  ) {
    return;
  }
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return;
  }
  if (url.protocol !== "https:" || !allowedOrigins.has(url.origin)) {
    throw new Error(
      `${file}: external media must use ${[...allowedOrigins].join(
        " or "
      )}: ${candidate}`
    );
  }
};

const htmlFiles = (
  await readdir(directory, { recursive: true, withFileTypes: true })
)
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => join(entry.parentPath, entry.name));

let inspected = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const label = relative(directory, file);
  for (const match of html.matchAll(/<(?:img|source|video)\b[^>]*>/gi)) {
    const tag = match[0];
    const src = attribute(tag, "src");
    if (src) {
      assertAllowed(src, label);
      inspected += 1;
    }
    const poster = attribute(tag, "poster");
    if (poster) {
      assertAllowed(poster, label);
      inspected += 1;
    }
    const srcset = attribute(tag, "srcset");
    if (srcset) {
      for (const item of srcset.split(",")) {
        assertAllowed(item, label);
        inspected += 1;
      }
    }
  }
  for (const match of html.matchAll(
    /<meta\b[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/gi
  )) {
    const content = attribute(match[0], "content");
    if (content) {
      assertAllowed(content, label);
      inspected += 1;
    }
  }
}

process.stdout.write(
  `Verified ${inspected} media sources in ${htmlFiles.length} HTML files; allowed origins: ${[
    ...allowedOrigins,
  ].join(", ")}\n`
);
