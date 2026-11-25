# Changelog

## Unreleased

- Added Sveltia CMS 0.272.0 with schema validation, bilingual collections,
  simple workflow, pinned SRI and responsive single-pane editing.
- Added publication lifecycle support for scheduled, unlisted, archived,
  expired and withdrawn content, including 301/410 runtime behavior.
- Added a Cloudflare R2 media library, public media origin and bucket-scoped
  CORS.
- Vendored and deployed the pinned Sveltia CMS authenticator Worker.
- Added direct CMS saves to `main`, automatic production deployment, live smoke
  tests and rollback on failure. Code pull requests retain isolated previews.
- Added a 15-minute scheduled-content check that rebuilds due publications.
- Resolved the dependency security release gate, added a high-severity audit
  check to CI, and verified the updated Sharp and Satori Open Graph output.
- Vendored 35 project Skills with a content-hashed lockfile and documented the
  MCP matrix and documented fallbacks.
- Added the public-template README, owner content checklist and current
  repository governance.
- Completed the independent-history and downstream-governance audit, while
  retaining the required upstream MIT provenance.
- Recorded the open dependency security gate that must be resolved before the
  stable `v0.1.0` release.
- Imported the Devosfera baseline and retained its browsing and reading features.
- Added independent brand configuration, exact publication filters, portable
  search indexing, CI and Cloudflare candidate promotion.
- Added responsive Markdown/MDX tables, callouts and article extension points.
- Added Chinese and English routes, stable content identity, publication and
  activity feeds and bilingual browser tests.
- Added the editorial home, bilingual Garden and topic pages, research and
  library views, About and Now, publication relationships and accessible MDX tabs.
- Added explicit gallery alt text and credits, optional motion reduction,
  stable slug redirects and verified root and subpath builds.
- Added local Cloudflare preview, production-format response and rollback
  rehearsals, and mobile loading performance checks.
