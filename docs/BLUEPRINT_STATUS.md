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

| Stage                             | Status                          | Assessment                                                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 baseline                       | Complete                        | Exact source, toolchain, native limitation and compatibility build are recorded. Reference remotes were intentionally removed after the clean history reset; fixed revisions remain documented                                                  |
| S1 safety and automation          | Complete                        | Indexing policy, JSON-LD escaping, publication filtering, portable Pagefind, CI, candidate promotion and dependency security remediation pass locally. The non-indexable Cloudflare preview and production apex route are deployed and verified |
| S2 AstroPaper features            | Complete                        | Callouts, responsive tables, extension slots, article controls, stable transitions, safe JSON-LD, search links and URL helpers are implemented and tested                                                                                       |
| S3 bilingual content architecture | Complete                        | Locale registry, translation resolution, stable publication identity, unified feed, Garden relations, CJK reading time and bilingual output are implemented                                                                                     |
| S4 independent release foundation | Hosted; stable approval pending | Browser tests, performance checks, release drill and documentation exist. The production apex route is active. Stable `v0.1.0` and final owner-approved content remain pending                                                                  |
| S5 AstroWind                      | Accepted for `v0.1.0`           | Bento, Timeline, Tabs and Gallery shelf patterns exist as project-owned implementations with local data, accessibility coverage and tests. Further AstroWind scope remains post-release                                                         |

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
publication filtering, and safe SEO output. Hosted preview indexing, the
production apex route, canonical URLs, feeds, search and 404 responses are
verified.

The dependency security gate is remediated in
[SECURITY_AUDIT.md](SECURITY_AUDIT.md). The branch updates Astro, Sharp, Satori
and affected lint packages, pins patched transitive ranges, and passes a full
frozen install, root and subpath builds, unit and browser tests, Open Graph
inspection, and the release and rollback drill. `pnpm audit` reports zero
vulnerabilities. GitHub's merged dependency graph also reports zero open
Dependabot alerts.

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

| Deliverable                                            | Status                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Independent buildable public template and version tag  | Public repository and `v0.1.0-rc.1` exist; stable `v0.1.0` is pending                                           |
| Every AstroPaper decision recorded                     | Complete                                                                                                        |
| Devosfera reader, search, gallery and theme regression | Complete in local and CI coverage                                                                               |
| Markdown/MDX publishing features                       | Complete                                                                                                        |
| Chinese/English SEO, OG, search, RSS and Sitemap       | Complete for static output                                                                                      |
| CI, E2E, backup and rollback                           | Complete, including zero-audit gating, hosted preview and production HTTP verification                          |
| Content adapter, unified feed and relationship layer   | Complete                                                                                                        |
| Long-term maintenance process                          | Documents and pinned Skills exist; public repository governance and Dependabot version-update resumption remain |

## Remaining work and owner inputs

### Code and project maintenance

- The merged dependency graph reports zero open Dependabot alerts.
- Keep Bento, Timeline, Tabs and Gallery as the accepted narrow S5 scope for
  `v0.1.0`; defer broader AstroWind integration until after the stable release.
- Decide whether About/Now need page-level canonical and OG overrides.
- Decide whether global search/TOC switches and generated static post
  pagination are required before the content library grows.
- Resume Dependabot version pull requests when routine maintenance starts.
- Keep pending release, deployment and design decisions in GitHub Issues until
  they are closed with evidence.

### Release and hosting

- Decide whether automated GitHub Actions Cloudflare deployment should use a
  repository API Token; interactive Wrangler device login currently handles
  manual deployment.
- Approve the first public indexing date.
- Create the stable `v0.1.0` tag only after owner approval.

### Owner-provided content

- Final display name, biography, author identity and public social links.
- Approved launch content.
- Licensed logo, photography and other media.
- Private conduct and security reporting contact.

### Repository governance

- The repository is public and is maintained as a GitHub Public template.
- Branch protection requires the Linux and Windows CI jobs.
- Automated security fixes and private vulnerability reporting are enabled.
- Skills are vendored and content-hashed so agent workflows are reproducible.

## Conclusion

The current code is independently maintainable and does not follow upstream Git
histories. The S0-S5 engineering foundation, security remediation, public
template governance, reproducible agent workflow, hosted preview and
production apex deployment are implemented. The full publication blueprint is
not fully delivered until final owner content, the first public indexing date
and stable release approval are complete.
