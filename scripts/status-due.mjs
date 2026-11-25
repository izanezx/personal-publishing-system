#!/usr/bin/env node

import { appendFile } from "node:fs/promises";

const baseUrl =
  process.env.PRODUCTION_URL?.replace(/\/$/, "") ?? "https://zanezx.com";
const manifestUrl =
  process.env.SCHEDULE_MANIFEST_URL ?? `${baseUrl}/runtime/schedule.json`;
const now = Date.now();

const response = await fetch(manifestUrl, {
  headers: { Accept: "application/json", "Cache-Control": "no-cache" },
});

if (!response.ok) {
  throw new Error(
    `Could not read ${manifestUrl}: ${response.status} ${response.statusText}`
  );
}

const manifest = await response.json();
const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
const due = entries.filter(
  entry =>
    typeof entry.activateAt === "string" &&
    new Date(entry.activateAt).getTime() <= now
);
const expiring = entries.filter(
  entry =>
    typeof entry.expireAt === "string" &&
    new Date(entry.expireAt).getTime() <= now
);
const hasDueActivation = due.length > 0;

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `due=${hasDueActivation}\ncount=${due.length}\n`
  );
}

process.stdout.write(
  JSON.stringify({
    manifestUrl,
    generatedAt: manifest.generatedAt,
    dueForPublication: due.map(entry => entry.path),
    expiredSinceLastBuild: expiring.map(entry => entry.path),
    rebuildRequired: hasDueActivation,
  }) + "\n"
);
