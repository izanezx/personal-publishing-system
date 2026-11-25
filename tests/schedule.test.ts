import assert from "node:assert/strict";
import test from "node:test";
import { classifyScheduleManifest } from "../scripts/schedule-due.mjs";

test("scheduled publication, expiration and archiving all trigger a rebuild", () => {
  const now = new Date("2026-06-01T00:00:00Z").getTime();
  const entries = [
    {
      path: "/posts/activate/",
      activateAt: "2026-05-31T23:59:00Z",
      expireAt: "2026-07-01T00:00:00Z",
    },
    {
      path: "/posts/expire/",
      expireAt: "2026-06-01T00:00:00Z",
    },
    {
      path: "/posts/archive/",
      archiveAt: "2026-05-01T00:00:00Z",
    },
    {
      path: "/posts/future/",
      activateAt: "invalid",
      expireAt: "2026-08-01T00:00:00Z",
    },
  ];

  const result = classifyScheduleManifest(entries, now);
  assert.deepEqual(
    result.activations.map(entry => entry.path),
    ["/posts/activate/"]
  );
  assert.deepEqual(
    result.expirations.map(entry => entry.path),
    ["/posts/expire/"]
  );
  assert.deepEqual(
    result.archives.map(entry => entry.path),
    ["/posts/archive/"]
  );
  assert.equal(result.rebuildRequired, true);
});

test("an empty or future-only schedule does not deploy", () => {
  const result = classifyScheduleManifest(
    [
      {
        path: "/posts/future/",
        activateAt: "2027-01-01T00:00:00Z",
        expireAt: "2027-02-01T00:00:00Z",
        archiveAt: "2027-03-01T00:00:00Z",
      },
    ],
    new Date("2026-01-01T00:00:00Z").getTime()
  );
  assert.equal(result.rebuildRequired, false);
});
