<div align="center">

# zanezx · Personal Publishing System

**An independent, bilingual Astro publication for essays, research notes, digital gardens, projects and visual records.**

[![CI](https://github.com/izanezx/personal-publishing-system/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/izanezx/personal-publishing-system/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/github/license/izanezx/personal-publishing-system)](LICENSE)
[![Node 24](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](.node-version)
[![Astro 7](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](package.json)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](wrangler.jsonc)
[![GitHub template](https://img.shields.io/badge/GitHub-Public_template-181717?logo=github)](https://github.com/izanezx/personal-publishing-system)

A long-lived publishing system built from the Devosfera reading experience, enhanced with selected AstroPaper engineering practices, and maintained independently from both upstream projects.

[Features](#features) · [Project structure](#project-structure) · [Quick start](#quick-start) · [Content](#content-model) · [Commands](#commands) · [Deployment](#cloudflare-deployment) · [Agent setup](#agent-workflow)

</div>

<img src="docs/assets/readme-home.png" alt="Chinese home page of the Personal Publishing System" />

> [!NOTE]
> The current site configuration is a production-ready engineering candidate. The display name `zanezx` is temporary, the public biography and launch content are pending, and `zanezx.com` has not yet been bound to a production Cloudflare Worker.

## Features

- **Bilingual publishing:** Chinese at `/`, English at `/en/`, with translation-aware navigation and canonical URLs.
- **Editorial content model:** stable UIDs, permanent slugs, redirects, relationships, topics, maturity and exact publication time.
- **Multiple publishing formats:** essays and research articles, Notes, Projects, Library entries, Garden topics and Galleries.
- **Reading experience retained from Devosfera:** reading mode, search, table of contents, light and dark themes, gallery lightboxes and optional motion reduction.
- **Selected AstroPaper practices:** callouts, responsive tables, extension slots, shareable search, typed settings, safe JSON-LD and CJK-aware Open Graph images.
- **Static output:** Astro static generation, Pagefind search, RSS, activity feed, Sitemap, robots and dynamic social images.
- **Quality gates:** unit tests, Chromium end-to-end tests, accessibility-oriented interactions, performance budgets, root and subpath builds, and a Cloudflare promotion and rollback drill.
- **Reproducible agent workflow:** 35 vendored Skills, a content-hashed `skills-lock.json`, explicit MCP fallbacks and project instructions in [AGENTS.md](AGENTS.md).

## Tech stack

| Area            | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Framework       | Astro 7 with TypeScript                               |
| Styling         | Tailwind CSS 4                                        |
| Content         | Astro Content Collections, Markdown and MDX           |
| Search          | Pagefind 1.6                                          |
| Images          | Sharp, Satori and resvg                               |
| Browser tests   | Playwright                                            |
| Package manager | pnpm 10.28.0                                          |
| Runtime         | Node.js 24.22.3                                       |
| Hosting         | Cloudflare Workers Static Assets                      |
| Release control | GitHub Actions, Dependabot and gated Wrangler deploys |

## Project structure

```text
.
├── .agents/skills/          # Reproducible project Skills for coding agents
├── .github/                 # CI, deployment and repository templates
├── docs/                    # Product, acceptance, release and owner guides
├── public/                  # Static files, headers and favicon
├── scripts/                 # Build, search, release and Skill verification
├── src/
│   ├── components/          # Reader, navigation and editorial components
│   ├── data/
│   │   ├── blog/{zh-cn,en}/ # Essays and research
│   │   ├── galleries/       # Localized gallery metadata and media
│   │   └── pages/           # Localized About and Now pages
│   ├── i18n/                # Locale registry and interface strings
│   ├── layouts/             # Site, article, listing and Garden layouts
│   ├── lib/content/         # Identity, publication and relationship queries
│   ├── pages/               # Chinese root and English /en/ routes
│   ├── scripts/             # Progressive browser enhancements
│   └── styles/              # Global and article styles
├── tests/                   # Unit, browser and release tests
├── astro.config.ts
├── wrangler.jsonc
└── skills-lock.json
```

## Quick start

### Requirements

- Node.js `24.22.3`
- pnpm `10.28.0`

With Corepack:

```bash
corepack enable
git clone https://github.com/izanezx/personal-publishing-system.git
cd personal-publishing-system
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:4321`. Search requires a production build because Pagefind indexes the final static artifacts:

```bash
pnpm build
pnpm preview
```

### Use as a GitHub template

The repository is a GitHub public template. You can use **Use this template → Create a new repository** for a derivative project. Review [UPSTREAM_BASELINES.md](UPSTREAM_BASELINES.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and all third-party license files before redistributing a modified template.

## Configuration

The temporary public identity and optional integrations are configured in:

- `src/lib/site-settings.ts`: site URL, title, description, author, timezone and listing limits.
- `src/config.ts`: theme, sharing, edit links, motion and optional audio.
- `.env`: public social links and edit URL. Never commit `.env`.
- `src/data/pages/{zh-cn,en}/`: About and Now page content.

Owner-specific launch material is tracked in [docs/OWNER_CONTENT_CHECKLIST.md](docs/OWNER_CONTENT_CHECKLIST.md).

## Content model

Chinese posts live in `src/data/blog/zh-cn/`; English posts live in `src/data/blog/en/`. The schema is defined in `src/content.config.ts`.

Each publication has a stable identity independent of its folder and title:

```yaml
uid: publishing-baseline
slug: publishing-baseline
previousSlugs: []
translationKey: publishing-baseline
pubDatetime: 2026-01-10T09:00:00+08:00
kind: essay
topics: [publishing]
maturity: evergreen
```

When a public URL changes, append the old slug to `previousSlugs` so the static host can emit a permanent redirect. Draft and future content is excluded from routes, feeds, sitemap and search.

Read [docs/PRODUCT.md](docs/PRODUCT.md) for the route and publishing contract, [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries, and [GALLERIES.md](GALLERIES.md) for media metadata and alt text.

## Commands

| Command               | Action                                                     |
| --------------------- | ---------------------------------------------------------- |
| `pnpm dev`            | Start the Astro development server                         |
| `pnpm build`          | Type-check, build the site and generate the Pagefind index |
| `pnpm preview`        | Preview the generated static output                        |
| `pnpm test`           | Run unit tests                                             |
| `pnpm lint`           | Run ESLint                                                 |
| `pnpm format:check`   | Verify Prettier formatting                                 |
| `pnpm test:e2e`       | Run the Playwright browser suite                           |
| `pnpm test:release`   | Rehearse preview policy, production responses and rollback |
| `pnpm security:audit` | Fail on high or critical dependency advisories             |
| `pnpm skills:check`   | Verify every vendored Skill against `skills-lock.json`     |

Before opening a pull request, run:

```bash
pnpm security:audit
pnpm skills:check
pnpm test
pnpm lint
pnpm format:check
pnpm build
pnpm test:e2e
pnpm test:release
```

Subpath and deployment verification steps are in [docs/RELEASE.md](docs/RELEASE.md).

## Cloudflare deployment

Preview and production use separate Wrangler environments. Production consumes the exact artifact and commit from a successful preview run, verifies its SHA-256 manifest, and requires explicit owner approval.

Required GitHub Actions secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The token should be limited to the target account and Workers Scripts edit access. Never place the token in source, content or an issue. Follow the gated procedure in [docs/RELEASE.md](docs/RELEASE.md).

## Agent workflow

Project Skills are vendored under `.agents/skills/` and pinned by content hash. [AGENTS.md](AGENTS.md) maps each development activity to the Skills and repository checks that apply. [docs/AGENT_ENVIRONMENT.md](docs/AGENT_ENVIRONMENT.md) records upstream source revisions, MCP availability and documented fallbacks.

The project distinguishes:

- An **upstream commit** such as Matt Pocock's `abeeaf9`: the exact source revision recorded when a Skill was imported.
- A **project commit**: the independently maintained revision that becomes authoritative after import.

Known upstream sources are recorded. Vendoring and `skills-lock.json` make the repository copy reproducible even when an upstream moves, disappears or publishes incompatible changes.

## Maintenance and provenance

This repository has its own Git history and does not merge upstream development branches. Devosfera, AstroPaper and AstroWind are reviewed as read-only sources; relevant changes are adapted through normal issues and pull requests with tests.

- Devosfera `bba247e2`: licensed starting source and reader experience.
- AstroPaper `v7.2.0`: selected publishing and engineering practices.
- AstroWind `14e1a691`: selected component and agent workflow reference.

MIT copyright and provenance notices are retained in [LICENSE](LICENSE), [UPSTREAM_BASELINES.md](UPSTREAM_BASELINES.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Operational independence does not remove the attribution required for distributed derivative code.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md). Keep changes focused, link the relevant issue, update tests and documentation, and include every verification command you ran.

## Security

Report vulnerabilities privately through GitHub Security Advisories after private vulnerability reporting is enabled. See [SECURITY.md](SECURITY.md) and [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

## License

Released under the [MIT License](LICENSE). Third-party fonts, Skills and imported source retain their own notices.
