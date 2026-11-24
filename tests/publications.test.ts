import assert from "node:assert/strict";
import test from "node:test";
import { resolveSiteSettings } from "@/lib/site-settings";
import { calendarDate, isValidTimezone } from "@/lib/content/dates";
import { publicationTimestamp, type Publication } from "@/lib/content/model";
import {
  publicationRelations,
  validatePublications,
} from "@/lib/content/relations";
import { getEntryPath, getEntryTransitionName } from "@/utils/contentEntry";

const make = (uid: string, data: Partial<Publication> = {}): Publication => ({
  uid,
  slug: uid,
  previousSlugs: [],
  locale: "zh-CN",
  kind: "article",
  topics: ["publishing"],
  stage: "seedling",
  relationships: [],
  publishedAt: new Date("2025-12-31T15:45:00Z"),
  title: "Identical title",
  description: "",
  path: `/posts/${uid}/`,
  ...data,
});

test("publication integrity rejects collisions and broken internal URLs", () => {
  const entry = make("a", { previousSlugs: ["old"] });
  assert.throws(
    () => validatePublications([entry, make("a")]),
    /Duplicate publication UID/
  );
  assert.throws(
    () => validatePublications([entry, make("b", { path: "/posts/a/" })]),
    /Duplicate publication path/
  );
  assert.throws(
    () => validatePublications([entry, make("b", { path: "/posts/old/" })]),
    /Conflicting redirect/
  );
  assert.throws(
    () =>
      validatePublications([
        make("c", { relationships: [{ kind: "related", uid: "missing" }] }),
      ]),
    /Unknown related UID/
  );
  assert.throws(
    () => validatePublications([make("d", { topics: ["arbitrary"] })]),
    /Unknown topic/
  );
});

test("unpublished targets are omitted and visible backlinks stay stable", () => {
  const a = make("a", {
    relationships: [
      { kind: "related", uid: "b" },
      { kind: "evolvedFrom", uid: "c" },
    ],
  });
  const b = make("b", { relationships: [{ kind: "related", uid: "a" }] });
  validatePublications([a, b, make("c", { draft: true })]);
  const links = publicationRelations(a, [a, b]);
  assert.deepEqual(
    links.outgoing.map(x => x.target.uid),
    ["b"]
  );
  assert.deepEqual(
    links.incoming.map(x => x.uid),
    ["b"]
  );
});

test("permalink and transitions depend on explicit slug and UID, not folders or title", () => {
  const first = {
    collection: "blog" as const,
    id: "zh-cn/a",
    filePath: "old/a.md",
    data: { uid: "a", slug: "guide" },
  };
  const moved = { ...first, id: "zh-cn/moved/a", filePath: "new/a.md" };
  assert.equal(getEntryPath(first), getEntryPath(moved));
  assert.equal(getEntryTransitionName(first), getEntryTransitionName(moved));
  assert.notEqual(
    getEntryTransitionName(first),
    getEntryTransitionName({ ...moved, data: { uid: "b" } })
  );
});

test("calendar honors year, month and DST boundaries in the publication time zone", () => {
  const yearEnd = new Date("2025-12-31T15:45:00Z");
  assert.deepEqual(calendarDate(yearEnd, "Asia/Shanghai"), {
    year: 2025,
    month: 12,
    day: 31,
  });
  assert.deepEqual(
    calendarDate(new Date("2025-12-31T16:01:00Z"), "Asia/Shanghai"),
    { year: 2026, month: 1, day: 1 }
  );
  assert.deepEqual(
    calendarDate(new Date("2026-03-09T04:15:00Z"), "America/New_York"),
    { year: 2026, month: 3, day: 9 }
  );
  assert.equal(isValidTimezone("Mars/Olympus"), false);
});

test("edits change activity time without changing first publication time", () => {
  const entry = make("activity", {
    updatedAt: new Date("2026-02-01T00:00:00Z"),
  });
  assert.equal(
    publicationTimestamp(entry, "published"),
    entry.publishedAt.getTime()
  );
  assert.equal(
    publicationTimestamp(entry, "activity"),
    entry.updatedAt!.getTime()
  );
});

test("site settings fall back to the approved defaults and reject invalid overrides", () => {
  assert.equal(resolveSiteSettings().website, "https://zanezx.com/");
  assert.equal(
    resolveSiteSettings({ showGalleries: false }).showGalleries,
    false
  );
  assert.throws(
    () => resolveSiteSettings({ postPerPage: 0 }),
    /positive integers/
  );
  assert.throws(
    () => resolveSiteSettings({ timezone: "Mars/Olympus" }),
    /Invalid site time zone/
  );
  assert.throws(
    () => resolveSiteSettings({ website: "https://example.com/?wrong=1" }),
    /HTTP\(S\) origin/
  );
});
