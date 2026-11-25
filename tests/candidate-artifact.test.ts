import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createCandidate,
  verifyCandidate,
} from "../scripts/candidate-artifact.mjs";

test("candidate artifacts bind commit, policy and exact files", async () => {
  const root = await mkdtemp(join(tmpdir(), "candidate-test-"));
  const source = join(root, "dist");
  const destination = join(root, "candidate");
  const commit = "a".repeat(40);
  try {
    await mkdir(join(source, "runtime"), { recursive: true });
    await writeFile(join(source, "index.html"), "<h1>verified</h1>");
    await writeFile(
      join(source, "runtime", "indexing.json"),
      JSON.stringify({ enabled: false })
    );

    const created = await createCandidate({
      source,
      destination,
      mode: "production",
      commit,
      indexingEnabled: false,
      previewContent: false,
    });
    assert.equal(created.commit, commit);
    assert.equal(created.indexingEnabled, false);

    const verified = await verifyCandidate({
      directory: destination,
      expectedCommit: commit,
      expectedMode: "production",
      expectedIndexing: false,
      expectedPreviewContent: false,
    });
    assert.equal(verified.verified, true);
    assert.equal(verified.sha256, created.sha256);

    await writeFile(join(destination, "dist", "index.html"), "tampered");
    await assert.rejects(
      verifyCandidate({
        directory: destination,
        expectedCommit: commit,
        expectedMode: "production",
        expectedIndexing: false,
        expectedPreviewContent: false,
      }),
      /do not match/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
