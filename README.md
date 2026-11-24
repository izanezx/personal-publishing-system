# zanezx · Personal Publishing System

An independent, bilingual Astro publication for zanezx.com. Chinese is served
from the root and English from `/en/`. Devosfera commit `bba247e2` is retained
as licensed source provenance, while this repository's Git history begins with
its own project import commit. The editorial home links to Writing, Research,
Notes, Projects, Garden, Library and Gallery.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

Use Node 24.22.3 and pnpm 10.28.0. Build before previewing Pagefind search.
Keep optional local values in `.env`, using `.env.example` as a reference.

- Read the [product specification](docs/PRODUCT.md) for content and routes.
- Read the [architecture](ARCHITECTURE.md) and [gallery guide](GALLERIES.md)
  before adding content types or media.
- See the [acceptance record](docs/ACCEPTANCE.md) and
  [release guide](docs/RELEASE.md) for verification and owner handoff.
- See [contribution guidance](CONTRIBUTING.md) and
  [upstream references](UPSTREAM_BASELINES.md) for provenance and maintenance.
