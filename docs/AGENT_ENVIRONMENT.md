# Agent environment and Skills

Verified: 2026-11-25

## Reproducibility model

The 38 project Skills are vendored under `.agents/skills/`. Each directory has a
SHA-256 content hash in `skills-lock.json`. CI runs `pnpm skills:check`, so an
unreviewed addition, deletion or content change fails the build.

After an intentional Skill import or update:

```bash
pnpm skills:lock
pnpm skills:check
```

Commit the Skill files and the lock together. Review the Skill source and
license before updating the lock.

An **upstream commit** identifies the exact revision from which copied material
came. It is not a branch to merge and does not make that repository a runtime
dependency. Once imported, the vendored file and this repository's commit are
the authoritative version.

## Upstream sources

| Source                                                                                | Revision                                   | Skills                                         |
| ------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| [mattpocock/skills](https://github.com/mattpocock/skills)                             | `abeeaf95660ba9e8b7c753eb38f441ca707a8823` | 27 engineering and productivity Skills         |
| [astrolicious/agent-skills](https://github.com/astrolicious/agent-skills)             | `cb4839f3794189ebf35c55d3ba5d3876dff7acf0` | `astro`                                        |
| [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills)     | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | `accessibility`, `seo`                         |
| [delineas/astro-framework-agents](https://github.com/delineas/astro-framework-agents) | `3e32c91cc433424e162472b81afaa5e9324669bb` | `astro-framework`                              |
| [openai/skills](https://github.com/openai/skills)                                     | `49f948faa9258a0c61caceaf225e179651397431` | `cloudflare-deploy`, `gh-fix-ci`, `playwright` |
| [cloudflare/skills](https://github.com/cloudflare/skills)                             | `5108325ecceabc899c761e07aa617b09c02445ee` | `web-perf`                                     |
| [cloudflare/skills](https://github.com/cloudflare/skills)                             | `ff191de7d903788eceaf516a514ae7d3b56b924a` | `wrangler`, `workers-best-practices`           |
| [sveltia/ai-tools](https://github.com/sveltia/ai-tools)                               | `20431da85377c48eac96d659a342f4a8c2d3fb47` | `sveltia-cms`                                  |

The exact path and revision for every Skill are recorded in `skills-lock.json`.
The repository commit and per-directory SHA-256 makes the vendored copy
authoritative even if an upstream repository later changes or becomes
unavailable.

## Skill inventory

### Engineering

`ask-matt`, `code-review`, `codebase-design`, `diagnosing-bugs`,
`domain-modeling`, `grill-with-docs`, `implement-spec`, `implement`,
`improve-codebase-architecture`, `pr`, `prototype`, `research`, `retro`,
`setup-matt-pocock-skills`, `tdd`, `to-spec`, `to-tickets`, `triage`,
`wayfinder`, `wizard`, `writing-for-agents`.

### Product and productivity

`grill-me`, `grilling`, `handoff`, `teach`, `to-questionnaire`, `wait-what`.

### Web platform and release

`accessibility`, `astro`, `astro-framework`, `cloudflare-deploy`, `gh-fix-ci`,
`playwright`, `seo`, `sveltia-cms`, `web-perf`, `wrangler`,
`workers-best-practices`.

The activity-to-Skill map is maintained in [AGENTS.md](../AGENTS.md). The
working principle is to use the narrow Skill that fits the task while retaining
the project's pinned versions, content model and verification commands.

## MCP matrix

Directly configured MCP servers in the current Codex environment:

| Server             | Purpose                                      | Status  |
| ------------------ | -------------------------------------------- | ------- |
| `quota_line`       | Codex status-line integration through Magpie | Enabled |
| `magpie-artifacts` | Local interactive artifact service           | Enabled |

Connected app capabilities available to this environment include GitHub,
search, Atlassian, Notion, Linear, Canva, Figma, Gmail, Resend and OpenAI
Platform. They are used only when the current task needs the connected account.

Relevant MCP servers not configured for this project:

| Capability          | Current fallback                                                                |
| ------------------- | ------------------------------------------------------------------------------- |
| Astro documentation | Official pinned-version documentation at <https://docs.astro.build/>            |
| Chromium inspection | Playwright 1.65.1 and project traces                                            |
| Cloudflare          | Pinned `wrangler@4.165.0` with repository-guided authentication and deployment  |
| Accessibility       | Playwright keyboard checks, semantic review and optional Lighthouse/axe tooling |
| Web performance     | Playwright performance budgets and available browser metrics                    |

MCP availability is not part of the released website's runtime. A missing MCP
server must not silently change verification policy; use the documented
fallback and state any limitation.

## License handling

Preserve the `LICENSE`, `NOTICE`, `CREDITS` and source metadata files inside
vendored Skills. The repository-level
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) records the larger source
baselines. Do not remove a license because a Skill is copied into this
repository.
