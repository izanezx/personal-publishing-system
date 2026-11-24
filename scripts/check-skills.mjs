#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const skillsRoot = join(root, ".agents", "skills");
const lock = JSON.parse(readFileSync(join(root, "skills-lock.json"), "utf8"));
const writeLock = process.argv.includes("--write");

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    })
    .sort();
}

function hashSkill(directory) {
  const hash = createHash("sha256");
  for (const file of filesBelow(directory)) {
    const relativePath = relative(directory, file).split(sep).join("/");
    const content = readFileSync(file);
    const normalizedContent = Buffer.from(
      content.toString("latin1").replace(/\r\n/g, "\n"),
      "latin1"
    );
    hash.update(relativePath);
    hash.update("\0");
    hash.update(normalizedContent);
    hash.update("\0");
  }
  return hash.digest("hex");
}

const actualNames = readdirSync(skillsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();

if (writeLock) {
  const previousSources = new Map(
    lock.skills.map(skill => [skill.name, skill.source])
  );
  lock.verifiedAt = new Date().toISOString().slice(0, 10);
  lock.skills = actualNames.map(name => ({
    name,
    vendorPath: `.agents/skills/${name}`,
    sha256: hashSkill(join(skillsRoot, name)),
    source: previousSources.get(name) ?? {
      repository: null,
      path: null,
      revision: null,
    },
  }));
  writeFileSync(
    join(root, "skills-lock.json"),
    `${JSON.stringify(lock, null, 2)}\n`
  );
  process.stdout.write(
    `Updated ${lock.skills.length} vendored project skills.\n`
  );
  process.exit(0);
}

const expectedNames = lock.skills.map(skill => skill.name);
const failures = [];

if (JSON.stringify(actualNames) !== JSON.stringify([...expectedNames].sort())) {
  failures.push(
    `Skill inventory differs.\nExpected: ${[...expectedNames].sort().join(", ")}\nActual: ${actualNames.join(", ")}`
  );
}

for (const skill of lock.skills) {
  const directory = join(skillsRoot, skill.name);
  try {
    const actualHash = hashSkill(directory);
    if (actualHash !== skill.sha256) {
      failures.push(
        `${skill.name}: expected ${skill.sha256}, received ${actualHash}`
      );
    }
  } catch {
    failures.push(`${skill.name}: directory or files are missing`);
  }
}

if (failures.length) {
  process.stderr.write(
    `Skill lock verification failed:\n- ${failures.join("\n- ")}\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Verified ${lock.skills.length} vendored project skills.\n`
  );
}
