# Publishing architecture

Astro renders a static site and Pagefind indexes that exact output in `dist`.
The root is Chinese and English is served under `/en/`. The static release
uses a Cloudflare Workers Assets configuration. GitHub Actions holds
deployment credentials separately from the ordinary PR workflow.

Blog entries support articles, notes and projects. Each entry declares a
stable `uid` and `slug`, with an optional shared `translationKey` for a
translation in the same collection. Directory paths are internal loader IDs.
Published URLs come from the explicit slug and the language. The build rejects
duplicate IDs, public paths and language-specific translation keys. Scheduled
content becomes eligible at its specified instant and is published on the
next successful build. The regular RSS feed orders by first publication;
`activity.xml` orders by publication or revision.

Markdown and MDX share the Unified processor and rehype transforms. Existing
Astro client scripts handle search, theme, reading controls and gallery dialogs.
`Head`, `BodyEnd` and `PostEnd` are named publishing extension points.
The layout emits alternates for known public translations and static mirrored
routes. Cross-language links are omitted for entries without a public translation.
