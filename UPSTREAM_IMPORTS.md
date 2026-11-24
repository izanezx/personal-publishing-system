# Upstream integration decisions

AstroPaper v7.2.0 at `ffd0260a` was the engineering reference for the
publishing foundations work.
The exact source revisions are in [UPSTREAM_BASELINES.md](UPSTREAM_BASELINES.md).

| Blueprint | Decision | Project implementation and verification                                                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP-01     | Adapt    | Unified and rehype callouts for Markdown and MDX, verified by the mobile article check                                                            |
| AP-02     | Adapt    | Rehype scrollable table wrapper, verified at narrow width with keyboard focus                                                                     |
| AP-03     | Adapt    | ResponsiveTable for MDX with minimal and striped variants, verified with a single wrapper                                                         |
| AP-04     | Adapt    | Head, BodyEnd and PostEnd slots, with article type and metadata supplied to the extension                                                         |
| AP-05     | Adapt    | Article canonical, hideToc, hideEditPost and timezone, with displayed dates and SEO tests                                                         |
| AP-06     | Adapt    | About and Now in a pages collection, verified in both languages                                                                                   |
| AP-07     | Adapt    | Typed site defaults, site and configuration validation, and tests for feature flags                                                               |
| AP-08     | Adapt    | Exact date cutoff and explicit timezones for article and archive dates, with boundary tests                                                       |
| AP-09     | Adapt    | Escape JSON-LD before HTML insertion, with serializer regression tests                                                                            |
| AP-10     | Adapt    | Derive transition names from UID, tested with conflicting titles                                                                                  |
| AP-11     | Adopt    | Generate Pagefind directly from the current `dist`, verified on the prior Linux and Windows CI candidate                                          |
| AP-12     | Adopt    | GitHub Actions, Dependabot and Chromium checks                                                                                                    |
| AP-13     | Adapt    | Shareable search queries, navigation history and focus restoration                                                                                |
| AP-14     | Adapt    | Locale-aware path resolver and configurable base, checked with a subpath build and Chromium                                                       |
| AP-15     | Adapt    | Chinese and English OG routes with Noto Sans CJK, publication gating and HTTP checks. React-specific compatibility is conditional on adding React |

AstroPaper decisions are tracked through the repository's task records,
acceptance report and focused regression tests. Upstream commits, issues and
pull requests are read-only references; this repository keeps its own Git
history.
The local acceptance round extends the earlier candidate and uses the checks
listed in [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).

## AstroWind engineering and component references

Reviewed AstroWind at `14e1a691f80548dcc36370847b1a02c0d0b12821`, whose
license is MIT, copyright 2023 onWidget. Its AGENTS.md and
`.agents/skills/add-component.md` informed the local guidance on UI and
editorial component boundaries. The site components below are project
implementations using this site's tokens and publication data.

| Reference                                     | Project implementation                                    | Evidence                                                       |
| --------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| `widgets/Bento.astro`                         | Editorial home index                                      | Narrow viewport and real Garden navigation                     |
| `ui/Timeline.astro`, `widgets/Timeline.astro` | Home activity timeline                                    | Dated bilingual content and feed sort tests                    |
| `widgets/FeatureTabs.astro`                   | `ui/Tabs.astro` for interactive MDX                       | Keyboard, selected state and scripting disabled                |
| `widgets/Gallery.astro`                       | `editorial/GalleryShelf.astro` and existing gallery cards | Image metadata, gallery navigation and Lightbox browser checks |

## Future updates

Review dependency alerts weekly or every two weeks, the three repositories
monthly and the integration priorities quarterly. Select each change against
the pinned version and record its project, version or commit, motivation,
files, tests, rollback and owning PR. Prioritize Devosfera reader fixes,
AstroPaper SEO, accessibility and build fixes, and AstroWind component patterns.
Major Astro, MDX, Tailwind, Satori and Pagefind updates each get an upgrade
branch, compatibility build, browser checks, performance comparison and
preview before release. Keep the previous lockfile and verified deployment
available for rollback.
