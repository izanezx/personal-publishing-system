# Local acceptance

The acceptance criteria come from the original “选择Astro博客模板” conversation, “Personal Publishing
System 项目执行计划 · v2”, and “Devosfera Personal Publishing System — 基线融合与长期维护实施蓝图”.

The development checkout is `/data/workspace/personal-publishing-system`.
Devosfera supplies the licensed source baseline at `bba247e2`; its provenance
and MIT notice are recorded in [UPSTREAM_BASELINES.md](../UPSTREAM_BASELINES.md).
This repository starts a new Git history for the independently maintained
project. Upstream commits, issues and pull requests remain read-only references.

| Stage and task | Evidence in the checkout                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 · PR-00     | Clean project root commit, source provenance and lockfile, Node/pnpm pins, frozen install, original checks and compatibility results in [BASELINE.md](../BASELINE.md). |
| S1 · PR-01     | Brand defaults and separate production and preview robots controls. Real HTTP responses verified against a local Wrangler asset server                                 |
| S1 · PR-02     | Escaped JSON-LD. Draft and future content excluded from HTML, OG, RSS, Sitemap and search                                                                              |
| S1 · PR-03     | Portable Pagefind post-build indexing for the current static artifact. Native Linux and Windows evidence exists for the earlier candidate                              |
| S1 · PR-04     | CI, Dependabot and gated Cloudflare workflow. Production verifies the exact preview commit and artifact checksum                                                       |
| S2 · PR-05     | Markdown and MDX callouts and narrow-screen tables, including a separately rendered MDX ResponsiveTable                                                                |
| S2 · PR-06     | Project-wide Head, BodyEnd and PostEnd extensions. PostEnd receives the content entry and locale for per-type additions                                                |
| S2 · PR-07     | Article canonical, TOC and edit switches, timezone validation, typed defaults and stable transition IDs                                                                |
| S2 · PR-08     | Shareable search, back navigation and base-path-aware links, Pagefind, RSS, OG and hreflang                                                                            |
| S3 · PR-09     | Chinese root, English `/en/`, existing-locale alternates and suppression of unavailable article translations                                                           |
| S3 · PR-10     | Stable publication identity, slug redirects, bilingual editorial pages, topics, maturity and related publications                                                      |
| S3 · PR-11     | Unified query for Blog and Gallery, independent publication and activity ordering and localized RSS                                                                    |
| S3 · PR-12     | CJK reading time, content indexing, paths, archive dates and Open Graph output                                                                                         |
| S4 · PR-13     | Repeat navigation, configurable motion, scoped copy controls, Gallery instances and mobile browser performance budgets                                                 |
| S4 · PR-14     | Chromium suite and local Wrangler HTTP, checksum, backup and rollback rehearsal                                                                                        |
| S4 · PR-15     | Architecture, contribution and release guides, reference/license records, changelog and owner launch checklist                                                         |
| S5 · AstroWind | Scoped component patterns for the editorial index, timeline, tabs and galleries. Implementation and license decisions in [UPSTREAM_IMPORTS.md](../UPSTREAM_IMPORTS.md) |

## Regression evidence

- `pnpm test` exercises publishing cutoff, change ordering, title collision,
  permalinks, relationships, invalid inputs, DST and date boundaries.
- `pnpm test:e2e` exercises real Chinese and English pages, missing translations,
  search and navigation history, Gallery focus and unique instances, article
  reading controls, Markdown and MDX, Garden topics, feeds and SEO.
- The subpath run exercises the same static build mounted under
  `/publishing/` and `/posts/`. Chromium opens an actual Pagefind result and a
  Chinese tag URL.
- An isolated fixture build verified a canonical override, edit-link opt-out
  and branch URL, safe JSON-LD with a script-closing title, and a Los Angeles
  publication that appeared in the December archive despite its January UTC
  timestamp. Additional builds rejected a duplicate UID and an invalid timezone.
- `pnpm test:release` serves separate preview and production-format artifacts,
  checks HTTP responses and verifies the restored backup hash and the restored
  site's response. The root build emits 56 HTML pages and Pagefind indexes 10
  public entries across both languages.

See the [baseline and performance comparison](../BASELINE.md) for the archived
screenshot, resource sizes and measurement method. The local candidate uses
synthetic content and is tagged locally as `v0.1.0-rc.1`. The new candidate
CI, hosted preview, owner-approved content, production domain and
`v0.1.0` release are tracked in the [release handoff](RELEASE.md).
The original project issues remain
the review records for these steps.
