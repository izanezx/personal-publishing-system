#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const allowedPaths = [
  /^src\/data\/blog\/(?:zh-cn|en)\/[^/]+\.md$/,
  /^src\/data\/galleries\/(?:zh-cn|en)\/[^/]+\/index\.md$/,
  /^src\/data\/pages\/(?:zh-cn|en)\/(?:about|now)\.md$/,
  /^src\/data\/tombstones\/[^/]+\.ya?ml$/,
];

const source = process.argv.includes("--file")
  ? await readFile(process.argv[process.argv.indexOf("--file") + 1], "utf8")
  : await new Response(process.stdin).text();
const paths = source
  .split(/\r?\n/)
  .map(path => path.trim())
  .filter(Boolean);

if (paths.length === 0) {
  throw new Error("The pull request does not contain any changed files");
}

const disallowed = paths.filter(
  path => !allowedPaths.some(pattern => pattern.test(path))
);
if (disallowed.length > 0) {
  throw new Error(
    `CMS auto-merge is limited to editorial content files:\n${disallowed.join("\n")}`
  );
}

process.stdout.write(
  `Verified ${paths.length} content-only file${paths.length === 1 ? "" : "s"}.\n`
);
