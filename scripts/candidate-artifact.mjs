#!/usr/bin/env node

import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const manifestName = "candidate.json";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "true";
      continue;
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

const parseBoolean = (value, name) => {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  throw new Error(`--${name} must be true or false`);
};

export async function fingerprintDirectory(directory) {
  const root = resolve(directory);
  const hash = createHash("sha256");
  const files = (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name).slice(root.length + 1))
    .sort();

  for (const relativePath of files) {
    const digest = createHash("sha256")
      .update(await readFile(join(root, relativePath)))
      .digest("hex");
    hash.update(JSON.stringify([relativePath, digest]));
  }
  return { sha256: hash.digest("hex"), files: files.length };
}

export async function createCandidate({
  source,
  destination,
  mode,
  commit,
  indexingEnabled,
  previewContent,
}) {
  if (!["production", "preview"].includes(mode)) {
    throw new Error("Candidate mode must be production or preview");
  }
  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error("Candidate commit must be a full 40-character Git SHA");
  }
  if (mode === "production" && previewContent) {
    throw new Error(
      "Production candidates cannot include preview-only content"
    );
  }
  if (mode === "preview" && indexingEnabled) {
    throw new Error("Preview candidates must disable public indexing");
  }

  const output = resolve(destination);
  const dist = join(output, "dist");
  await rm(output, { recursive: true, force: true });
  await mkdir(dirname(output), { recursive: true });
  await cp(resolve(source), dist, { recursive: true });

  const { sha256, files } = await fingerprintDirectory(dist);
  const manifest = {
    schemaVersion: 1,
    mode,
    commit,
    indexingEnabled,
    previewContent,
    fileCount: files,
    sha256,
    createdAt: new Date().toISOString(),
  };
  await writeFile(
    join(output, manifestName),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  return manifest;
}

export async function verifyCandidate({
  directory,
  expectedCommit,
  expectedMode,
  expectedIndexing,
  expectedPreviewContent,
}) {
  const root = resolve(directory);
  const manifest = JSON.parse(await readFile(join(root, manifestName), "utf8"));
  if (manifest.schemaVersion !== 1) {
    throw new Error("Candidate manifest schema is unsupported");
  }
  if (!/^[0-9a-f]{40}$/i.test(manifest.commit ?? "")) {
    throw new Error("Candidate manifest commit is invalid");
  }
  if (expectedCommit && manifest.commit !== expectedCommit) {
    throw new Error(
      `Candidate commit mismatch: ${manifest.commit} != ${expectedCommit}`
    );
  }
  if (expectedMode && manifest.mode !== expectedMode) {
    throw new Error(
      `Candidate mode mismatch: ${manifest.mode} != ${expectedMode}`
    );
  }
  if (
    expectedIndexing !== undefined &&
    manifest.indexingEnabled !== expectedIndexing
  ) {
    throw new Error(
      `Candidate indexing mismatch: ${manifest.indexingEnabled} != ${expectedIndexing}`
    );
  }
  if (
    expectedPreviewContent !== undefined &&
    manifest.previewContent !== expectedPreviewContent
  ) {
    throw new Error(
      `Candidate preview-content mismatch: ${manifest.previewContent} != ${expectedPreviewContent}`
    );
  }

  const { sha256, files } = await fingerprintDirectory(join(root, "dist"));
  if (sha256 !== manifest.sha256 || files !== manifest.fileCount) {
    throw new Error(
      "Candidate files do not match the verified SHA-256 manifest"
    );
  }

  const runtimeIndexing = JSON.parse(
    await readFile(join(root, "dist", "runtime", "indexing.json"), "utf8")
  );
  if (runtimeIndexing.enabled !== manifest.indexingEnabled) {
    throw new Error(
      "Candidate runtime indexing policy differs from its manifest"
    );
  }
  return { ...manifest, verified: true, sha256, fileCount: files };
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (command === "create") {
    const manifest = await createCandidate({
      source: args.source ?? "dist",
      destination: args.destination,
      mode: args.mode ?? "production",
      commit: args.commit,
      indexingEnabled: parseBoolean(args.indexing, "indexing"),
      previewContent: parseBoolean(args["preview-content"], "preview-content"),
    });
    process.stdout.write(`${JSON.stringify(manifest)}\n`);
    return;
  }

  if (command === "verify") {
    const directory = rest.find(value => !value.startsWith("--"));
    if (!directory) {
      throw new Error("Provide the candidate directory");
    }
    const result = await verifyCandidate({
      directory,
      expectedCommit: args.commit,
      expectedMode: args.mode,
      expectedIndexing:
        args.indexing === undefined
          ? undefined
          : parseBoolean(args.indexing, "indexing"),
      expectedPreviewContent:
        args["preview-content"] === undefined
          ? undefined
          : parseBoolean(args["preview-content"], "preview-content"),
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }

  throw new Error("Use create or verify");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
