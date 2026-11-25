import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  cp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { applyPreviewPolicy } from "./preview-policy.mjs";

const scratch = await mkdtemp(join(tmpdir(), "publishing-release-"));
const artifacts = Object.fromEntries(
  ["archived", "candidate", "preview", "restored"].map(name => [
    name,
    join(scratch, name),
  ])
);
const wranglerArgs = ["dlx", "wrangler@4.165.0"];

async function fingerprint(dir) {
  const hash = createHash("sha256");
  for (const path of (
    await readdir(dir, { recursive: true, withFileTypes: true })
  )
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name).slice(dir.length + 1))
    .sort()) {
    const content = await readFile(join(dir, path));
    hash.update(
      JSON.stringify([path, createHash("sha256").update(content).digest("hex")])
    );
  }
  return hash.digest("hex");
}

async function freePort() {
  const socket = createServer();
  await new Promise((accept, reject) =>
    socket.listen(0, "127.0.0.1", accept).once("error", reject)
  );
  const { port } = socket.address();
  await new Promise((accept, reject) =>
    socket.close(error => (error ? reject(error) : accept()))
  );
  return port;
}

async function serve(assets, verify) {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(
    "pnpm",
    [
      ...wranglerArgs,
      "dev",
      "--local",
      "--env",
      "",
      "--ip",
      "127.0.0.1",
      "--port",
      String(port),
      "--inspector-port",
      "0",
      "--persist-to",
      join(scratch, "persist"),
      "--assets",
      assets,
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    }
  );
  let log = "";
  child.stdout.on("data", data => (log += data));
  child.stderr.on("data", data => (log += data));
  let failed;
  child.once("error", error => {
    failed = error;
  });
  const exited = new Promise(accept => child.once("exit", accept));
  try {
    let response;
    for (let attempt = 0; attempt < 120; attempt++) {
      if (failed || child.exitCode !== null || child.signalCode)
        throw new Error(log || String(failed));
      response = await fetch(origin + "/", {
        signal: AbortSignal.timeout(500),
      }).catch(() => undefined);
      if (response?.ok) break;
      await setTimeout(250);
    }
    assert(response?.ok, "Local Wrangler did not serve the site: " + log);
    await verify(origin, response);
  } finally {
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
    await Promise.race([exited, setTimeout(2000)]);
  }
}

async function verifyProduction(origin, home, version) {
  const indexing = await (
    await fetch(origin + "/runtime/indexing.json")
  ).json();
  if (indexing.enabled) {
    assert.equal(home.headers.get("x-robots-tag"), null);
  } else {
    assert.equal(home.headers.get("x-robots-tag"), "noindex, nofollow");
  }
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
  assert.match(
    await home.text(),
    /rel="canonical" href="https:\/\/zanezx.com\//
  );
  assert.match(
    await (await fetch(origin + "/robots.txt")).text(),
    indexing.enabled
      ? /https:\/\/zanezx.com\/sitemap-index\.xml/
      : /Disallow:\s*\/$/m
  );
  assert.equal((await fetch(origin + "/sitemap-index.xml")).status, 200);
  assert.equal((await fetch(origin + "/en/rss.xml")).status, 200);
  assert.equal((await fetch(origin + "/__missing-test__/")).status, 404);
  assert.equal((await fetch(origin + "/posts/deleted-example/")).status, 404);
  const redirect = await fetch(origin + "/posts/publishing-guide/", {
    redirect: "manual",
  });
  assert.equal(redirect.status, 301);
  assert.equal(
    new URL(redirect.headers.get("location"), origin).pathname,
    "/posts/publishing-baseline/"
  );
  const aliasRedirect = await fetch(
    origin + "/posts/legacy-publishing-baseline/",
    { redirect: "manual" }
  );
  assert.equal(aliasRedirect.status, 301);
  assert.equal(
    new URL(aliasRedirect.headers.get("location"), origin).pathname,
    "/posts/publishing-baseline/"
  );
  const archived = await fetch(origin + "/posts/archived-fixture/");
  assert.equal(archived.status, 200);
  assert.match(await archived.text(), /data-archive-notice/);
  assert.equal(
    await (await fetch(origin + "/release-drill.txt")).text(),
    version
  );
}

try {
  const dist = resolve(process.argv[2] ?? "dist");
  await cp(dist, artifacts.archived, { recursive: true });
  await writeFile(join(artifacts.archived, "release-drill.txt"), "archived");
  await cp(artifacts.archived, artifacts.candidate, { recursive: true });
  await writeFile(join(artifacts.candidate, "release-drill.txt"), "candidate");
  const candidateDigest = await fingerprint(artifacts.candidate);
  const archivedDigest = await fingerprint(artifacts.archived);
  assert.notEqual(candidateDigest, archivedDigest);

  await cp(artifacts.candidate, artifacts.preview, { recursive: true });
  await applyPreviewPolicy(artifacts.preview);
  assert.equal(await fingerprint(artifacts.candidate), candidateDigest);
  await serve(artifacts.preview, async (origin, home) => {
    assert.equal(home.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.doesNotMatch(
      await (await fetch(origin + "/robots.txt")).text(),
      /Sitemap:/i
    );
    assert.equal(
      await (await fetch(origin + "/release-drill.txt")).text(),
      "candidate"
    );
  });
  await serve(artifacts.candidate, (origin, home) =>
    verifyProduction(origin, home, "candidate")
  );
  await cp(artifacts.archived, artifacts.restored, { recursive: true });
  assert.equal(await fingerprint(artifacts.restored), archivedDigest);
  await serve(artifacts.restored, (origin, home) =>
    verifyProduction(origin, home, "archived")
  );
  process.stdout.write(
    "PASS: local Cloudflare preview policy, production HTTP checks, and checksum-verified rollback\n"
  );
} finally {
  await rm(scratch, { recursive: true, force: true });
}
