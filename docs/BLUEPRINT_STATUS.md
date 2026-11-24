# Blueprint acceptance status

Audit date: 2026-11-24

## Scope

This record checks the current `main` branch against:

- The complete “选择Astro博客模板” conversation decisions.
- “Devosfera Personal Publishing System — 基线融合与长期维护实施蓝图”.
- Devosfera `bba247e2f95e352b3984a842e1a39467f3891b3d`.
- AstroPaper `v7.2.0`, `ffd0260a2947eea93a2f5bb80029edf5654c0e8a`.

The latest source comparison is in
[UPSTREAM_COMPARISON.md](UPSTREAM_COMPARISON.md).

## Upstream decoupling

| Check                           | Status                 | Evidence                                                                                                           |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Own Git history                 | Complete               | `main` starts from one project-owned root commit; every commit is maintained by this project                       |
| Own Git remotes                 | Complete               | `origin` is the only remote; no Devosfera, AstroPaper or AstroWind remote is configured                            |
| Submodules and Git dependencies | Complete               | No submodule or Git/file dependency is present                                                                     |
| Source coupling                 | Complete               | Runtime source imports project-local modules only                                                                  |
| Automatic upstream merging      | Removed                | Upstream work enters through a documented manual review and adaptation process                                     |
| Legal provenance                | Retained intentionally | MIT notices and exact upstream revisions remain in `LICENSE`, `UPSTREAM_BASELINES.md` and `THIRD_PARTY_NOTICES.md` |
| Project contribution metadata   | Complete               | Funding, issue, pull request and contribution files now describe this project instead of the upstream projects     |

The project is therefore operationally decoupled from upstream repositories.
Future upstream review is optional intake, not a source or build dependency.
The MIT provenance notices must remain while the derived code is distributed.

## Stage status

| Stage                             | Status                                           | Assessment                                                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 baseline                       | Complete                                         | Exact source, toolchain, native limitation and compatibility build are recorded. Reference remotes were intentionally removed after the clean history reset; fixed revisions remain documented |
| S1 safety and automation          | Local implementation complete; release gate open | Indexing policy, JSON-LD escaping, publication filtering, portable Pagefind, CI and candidate promotion code exist. Dependency security remediation and a hosted Cloudflare candidate remain   |
| S2 AstroPaper features            | Complete                                         | Callouts, responsive tables, extension slots, article controls, stable transitions, safe JSON-LD, search links and URL helpers are implemented and tested                                      |
| S3 bilingual content architecture | Complete                                         | Locale registry, translation resolution, stable publication identity, unified feed, Garden relations, CJK reading time and bilingual output are implemented                                    |
| S4 independent release foundation | Local development complete; release pending      | Browser tests, performance checks, release drill and documentation exist. Stable `v0.1.0`, approved content and production deployment are pending                                              |
| S5 AstroWind                      | Partially implemented ahead of sequence          | Bento, Timeline, Tabs and Gallery shelf patterns exist as local implementations. They must be accepted as pre-release experiments or reconsidered before the stable release                    |

## AstroPaper decision status

| Decisions       | Status                                 | Notes                                                                                                           |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| AP-01 to AP-03  | Complete                               | Markdown/MDX callouts and responsive tables                                                                     |
| AP-04           | Complete                               | Project-owned `Head`, `BodyEnd` and `PostEnd` extension points                                                  |
| AP-05 to AP-08  | Complete                               | Article controls, pages collection, typed settings, exact publication and timezone handling                     |
| AP-09 and AP-10 | Complete                               | Safe JSON-LD and stable transition identity                                                                     |
| AP-11           | Complete                               | Pagefind is built from `dist`; Linux and Windows CI pass                                                        |
| AP-12           | Implemented, maintenance mode deferred | CI and Chromium checks run. Dependabot version pull requests are intentionally paused until regular maintenance |
| AP-13 and AP-14 | Complete                               | Shareable search, back navigation, i18n and base-path helpers                                                   |
| AP-15           | Complete for current stack             | CJK dynamic OG and publication filtering pass without adding React                                              |

## Technical debt status

### P0

All six source-level P0 items are addressed: preview indexing, demo data
separation, i18n centralization, content adapters and queries, unified
publication filtering, and safe SEO output. The real production response and
domain remain release checks rather than code work.

The dependency supply chain is a separate open P0 release gate. GitHub reports
38 open Dependabot alerts: 23 high, 10 medium and 5 low. `pnpm audit` reports
34 unique advisory nodes using the same severity split except for 20 high, 9
moderate and 5 low; GitHub counts alerts per affected manifest and graph path.
Every alert currently has a patched version available. The most consequential
direct updates are `sharp` 0.34.5 to 0.35.5 and `satori` 0.26.0 to at least
0.33.5. The remaining patched transitive ranges include `brace-expansion`,
`fast-uri`, `fast-xml-parser`, `fflate`, `minimatch`, `nanoid`, `postcss`,
`postcss-selector-parser`, `source-map-js` and `zod`.

This must be fixed before `v0.1.0`. Use a dedicated security branch, update the
runtime image and Open Graph packages first, then resolve transitive ranges
through the lockfile. Run unit, lint, format, root and subpath builds, browser,
release and performance checks, inspect generated OG images, and record the
remaining audit output before merging.

### P1

| Item                                          | Status           | Notes                                                                                                                                    |
| --------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Layout responsibility reduction               | Partial, tracked | SEO, reading, publication links and other concerns were extracted. `Layout.astro` is 292 lines and `PostDetails.astro` remains 557 lines |
| Separate published, updated and activity time | Complete         | Feed sorting and boundary tests exist                                                                                                    |
| CJK reading time                              | Complete         | Locale-aware reading time is tested                                                                                                      |
| Licensed OG font                              | Complete         | Noto Sans CJK with its OFL notice is used for OG output                                                                                  |
| Scoped heading links and copy controls        | Complete         | Post scripts operate on the article surface and avoid navigation event buildup                                                           |
| Unique gallery IDs                            | Complete         | Duplicate gallery instances are covered in browser tests                                                                                 |
| Search lifecycle and accessibility            | Complete         | Deep links, history, focus and multilingual queries are tested                                                                           |
| Performance baseline                          | Complete         | Browser budgets cover the home page and an interactive article                                                                           |
| React OG compatibility                        | Deferred         | No React or Sandpack integration is present                                                                                              |

### P2

Media metadata and alt text, asymmetric translations, stable URL identity with
redirects, and the blueprint's main test matrix are implemented.

## Delivery definition

| Deliverable                                            | Status                                                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Independent buildable repository and version tag       | Repository and `v0.1.0-rc.1` exist; stable `v0.1.0` is pending                                                       |
| Every AstroPaper decision recorded                     | Complete                                                                                                             |
| Devosfera reader, search, gallery and theme regression | Complete in local and CI coverage                                                                                    |
| Markdown/MDX publishing features                       | Complete                                                                                                             |
| Chinese/English SEO, OG, search, RSS and Sitemap       | Complete for static output                                                                                           |
| CI, E2E, backup and rollback                           | Complete locally; dependency remediation, production deployment and HTTP verification pending                        |
| Content adapter, unified feed and relationship layer   | Complete                                                                                                             |
| Long-term maintenance process                          | Documents exist; issue cleanup, dependency-update resumption, security policy operation and branch protection remain |

## Remaining work and owner inputs

### Code and project maintenance

- Remediate the 38 open dependency security alerts and prove the resulting
  lockfile with the full release checklist before marking the supply chain
  gate complete.
- Decide whether the S5 AstroWind implementations stay in the `v0.1.0`
  candidate or are deferred until after the stable release.
- Decide whether About/Now need page-level canonical and OG overrides.
- Decide whether global search/TOC switches and generated static post
  pagination are required before the content library grows.
- Resume Dependabot version pull requests when routine maintenance starts.
- Keep pending release, deployment and design decisions in GitHub Issues until
  they are closed with evidence.

### Release and hosting

- Authorize the Cloudflare account and create appropriately scoped secrets.
- Run and verify a hosted preview.
- Bind `zanezx.com`, verify DNS, HTTPS, production headers, canonical URLs,
  feeds and the Worker version.
- Create the stable `v0.1.0` tag only after owner approval.

### Owner-provided content

- Final display name, biography, author identity and public social links.
- Approved launch content.
- Licensed logo, photography and other media.
- Private conduct and security reporting contact.

### Repository governance limitations

- The repository is currently private. GitHub private vulnerability alerts are
  enabled, but private vulnerability reporting and branch protection are not
  available under the current private repository plan.
- Once the repository becomes public or the account has GitHub Pro, enable
  branch protection requiring CI and review before merges.

## Conclusion

The current code is independently maintainable and can stop following upstream
Git histories now. The S0-S4 engineering foundation and S5 experiments are
locally implemented, but the full blueprint is not fully delivered until
dependency security remediation, hosted preview, production verification,
stable release approval, final owner content and repository governance are
completed.
