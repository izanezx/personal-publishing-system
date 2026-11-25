#!/usr/bin/env node

import { appendFile } from "node:fs/promises";
import { classifyScheduleManifest } from "./schedule-due.mjs";

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
const { activations, expirations, archives, rebuildRequired } =
  classifyScheduleManifest(entries, now);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `due=${rebuildRequired}\ncount=${activations.length + expirations.length + archives.length}\n`
  );
}

process.stdout.write(
  JSON.stringify({
    manifestUrl,
    generatedAt: manifest.generatedAt,
    dueForPublication: activations.map(entry => entry.path),
    expiredSinceLastBuild: expirations.map(entry => entry.path),
    dueForArchive: archives.map(entry => entry.path),
    rebuildRequired,
  }) + "\n"
);
