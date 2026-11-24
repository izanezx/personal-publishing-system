# Upstream comparison audit

Audit date: 2026-11-24

## Pinned inputs

| Project                    | Revision                                             | Role                                          |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Personal Publishing System | `c27ed57` at audit start                             | Independently maintained implementation       |
| Devosfera                  | `bba247e2f95e352b3984a842e1a39467f3891b3d`           | Initial licensed source baseline              |
| AstroPaper                 | `v7.2.0`, `ffd0260a2947eea93a2f5bb80029edf5654c0e8a` | Selected publishing and engineering reference |

The comparison uses the Git-tracked files from each exact revision. Generated
directories, dependencies and local evidence are excluded.

## Result

The current project is not a copy of either upstream template. It is a
Devosfera-derived Personal Publishing System with its own bilingual content
model, editorial routes, validation, tests, release controls and visual
composition. AstroPaper supplied selected engineering patterns that were
adapted to the existing reader architecture.

| Measurement                                       | Current | Devosfera | AstroPaper |
| ------------------------------------------------- | ------: | --------: | ---------: |
| Tracked files                                     |     227 |       176 |        153 |
| `src` TypeScript, Astro, JavaScript and CSS lines |  13,543 |    12,711 |      4,660 |
| Test lines                                        |     813 |       131 |          0 |
| Markdown and MDX content files                    |      16 |        24 |         19 |
| Files different from current                      |       - |       210 |        283 |

These counts show scale, not quality. In particular, the current project keeps
the larger reader experience while replacing almost all demonstration content.

## Retained from Devosfera

- The visual foundation, grid texture, accent system, light and dark modes,
  reading layout and gallery language remain recognizable.
- Search modal and inline search, reading mode, table of contents, lightboxes,
  share controls, reading time, cards and the optional motion preference are
  preserved.
- The bilingual routing concept is retained, but the languages and directory
  names changed from English/Spanish to Chinese/English.
- Dynamic Open Graph generation remains based on the same Satori and Sharp
  rendering approach.

## Changed or added by the current project

- The default locale is Chinese at `/`, with English at `/en/`. Devosfera uses
  English at `/` and Spanish at `/es/`; AstroPaper is English-only.
- Content has stable `uid`, `slug`, `previousSlugs`, `translationKey`, `topics`,
  maturity and typed relationships. Publication kinds cover articles, notes,
  projects, resources, patterns, links and quotes.
- Garden, Notes, Research, Projects, Library, Now, activity RSS and permanent
  slug redirects extend the original blog and gallery routes.
- Publication visibility is exact at the configured timestamp rather than
  day-granular, with per-entry IANA timezone validation.
- About and Now are localized content entries instead of standalone route
  files.
- The search index is generated directly from the final `dist` artifact
  instead of being copied back into `public`.
- The project adds deterministic content validation, safe JSON-LD
  serialization, root and subpath URL resolution, CJK Open Graph text and
  structured article metadata.
- Windows and Linux CI, Chromium coverage, a release drill, preview protection,
  exact candidate promotion and rollback evidence are project additions.
- Devosfera demonstration biographies, fonts, audio and stock galleries were
  removed. Current content and color assets are synthetic fixtures. The active
  reader typography uses system fonts; Noto Sans CJK is limited to OG rendering.

## Selectively absorbed from AstroPaper

The implementation confirms the fifteen decisions recorded in
[UPSTREAM_IMPORTS.md](../UPSTREAM_IMPORTS.md):

- Markdown and MDX callouts.
- Responsive tables with narrow-screen scrolling and an MDX table component.
- Named `Head`, `BodyEnd` and `PostEnd` extension points.
- Article canonical URL, edit-link, TOC and timezone flags.
- A localized pages collection.
- Typed site settings and validated feature inputs.
- Exact publication cutoff and timezone boundary handling.
- Escaped JSON-LD and transition names derived from stable publication identity.
- Pagefind built from the current static output.
- Shareable search state, back navigation and focus restoration.
- Locale-aware and base-path-aware links.
- CJK-aware dynamic OG routes.

The current project deliberately does not copy AstroPaper's visual theme,
configuration API, dependency set or file layout. It also uses the inherited
progressive posts view instead of AstroPaper's generated `[...page]` static
pagination. This is acceptable while the corpus is small, but static pagination
should be reconsidered when a single localized listing becomes large enough to
make the all-in-one HTML view costly.

Two AstroPaper capabilities are not complete parity items in the current code:

- About and Now support `title` and `description`, but not AstroPaper's
  page-level custom `canonicalURL` and `ogImage`.
- Search and TOC are always enabled on their existing routes; AstroPaper's
  global feature switches were not copied.

These are small optional gaps. Neither blocks the current product model.

## Engineering position

Devosfera provides six unit tests and no repository CI workflow at the pinned
revision. AstroPaper has strong lint, format and build CI, but no checked-in
automated test suite at `v7.2.0`. The current project has 14 unit tests,
15 Chromium tests, subpath coverage and a local Cloudflare preview, promotion
and rollback drill. The latest `main` CI run at the time of this audit passed.

Dependabot version PRs are intentionally paused until regular maintenance
begins so the first repository history contains only project-owned work.
Security alerts remain active and are a release blocker: the repository had 38
open alerts when this status was reviewed. Dependency remediation must precede
the stable release even though version-update pull requests remain paused.

## Findings that need an explicit project decision

1. The project sequence says AstroWind should follow a stable `v0.1.0`, but
   selected AstroWind component ideas are already implemented in S5. They
   should either be accepted as pre-release experiments or treated as
   replaceable references before `v0.1.0`.
2. The repository currently has MIT licensing and third-party notices, but it
   is private. The public open-source release still requires an explicit
   visibility change and final content, media and asset rights review.
3. The product specification previously described Devosfera typography. The
   implementation uses system fonts and only uses the bundled CJK font for Open
   Graph rendering.

## Release reading

S0-S5 are complete as a locally accepted engineering foundation. The current
revision is a release candidate, not yet a stable public open-source release.
Creating `v0.1.0` should follow owner decisions on typography, the AstroWind
scope, public content, asset rights and repository visibility.
