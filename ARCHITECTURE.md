# Publishing architecture

Astro renders a static site and Pagefind indexes that exact output in `dist`.
The root is Chinese and English is served under `/en/`. The static release
uses a Cloudflare Workers Assets configuration. GitHub Actions holds
deployment credentials separately from the ordinary PR workflow.

The Blog and Gallery adapters expose articles, notes, projects, resources,
patterns, links, quotes and galleries as publication records. Each entry declares a
stable `uid` and `slug`, with an optional shared `translationKey` for a
translation in the same collection. Directory paths are internal loader IDs.
Published URLs come from the explicit slug and the language. The build rejects
duplicate IDs, published and redirected paths, language-specific
translation keys, unknown topics and unresolved relationship targets. Scheduled
content becomes eligible at its specified instant and is published on the
next successful build. Record prior slugs in `previousSlugs` and the
build emits the matching permanent redirects. The regular RSS feed orders by first publication;
`activity.xml` orders by publication or revision.

Markdown and MDX share the Unified processor and rehype transforms. Existing
Astro client scripts handle search, theme, reading controls and gallery dialogs.
`Head`, `BodyEnd` and `PostEnd` are named publishing extension points.
The pages collection supplies About and Now. The home, feeds, Garden and
article relations use publication queries with a common visibility policy.
UI components receive the data they display.
The layout emits alternates for known public translations and static mirrored
routes. Cross-language links are omitted for entries without a public translation.

`src/lib/content/` owns publication normalization, validation and queries.
`src/i18n/locales.ts` and `src/lib/site-paths.ts` own locale and mount
resolution. `src/components/ui/` provides reusable presentation and
interaction, `src/components/editorial/` composes publication features
and `src/components/common/` contains shared document concerns.
The [product specification](docs/PRODUCT.md) describes the public routes.
