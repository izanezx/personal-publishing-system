# Upstream integration decisions

Source: AstroPaper v7.2.0 and the project integration blueprint.

| Blueprint | Decision | Project implementation                                                                                                    |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| AP-01–03  | Adapt    | Unified and rehype callouts, scrollable Markdown tables, ResponsiveTable for MDX                                          |
| AP-04–05  | Adapt    | Head, BodyEnd and PostEnd slots and article-level overrides                                                               |
| AP-06     | Defer    | Keep Astro file routes for static pages                                                                                   |
| AP-07     | Adapt    | Typed defaults and build-time validation for publishing fields                                                            |
| AP-08–10  | Adapt    | Exact publication cutoff, timezone validation, JSON-LD escaping and UID transition names                                  |
| AP-11–12  | Adopt    | Portable Pagefind index build, GitHub Actions and Dependabot                                                              |
| AP-13–14  | Adapt    | Search query links and locale-aware routes. The production site lives at the root of zanezx.com                           |
| AP-15     | Adapt    | Build and verify localized OG images and omit unpublished OG routes. React-specific checks belong to a future integration |

For each future upgrade, record its repository and revision, the behavior
being imported, where it was adapted, the relevant checks and the owning PR.
Evaluate security and compatibility changes before feature imports.
Evaluate AstroWind components after the first release.
