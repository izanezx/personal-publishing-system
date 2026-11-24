# Owner content and launch checklist

This checklist separates technical readiness from publication approval. Items
remain open until the repository owner supplies or approves the real material.

## Repository setup completed

Verified on 2026-11-24:

- The repository is public and enabled as a GitHub Public template.
- The description, `https://zanezx.com` homepage and initial topics are set.
- Dependabot alerts and automated security updates are enabled.
- Private vulnerability reporting and secret scanning push protection are
  enabled.
- `main` requires the Linux and Windows CI jobs, current branches, linear
  history and resolved conversations; force pushes and deletion are blocked.
- All 35 project Skills are tracked and pass `pnpm skills:check`.

## Identity and brand

- [ ] Confirm the final public display name, currently `zanezx`.
- [ ] Confirm whether `zanezx` is both the brand name and author display name.
- [ ] Provide a Chinese biography for the site and About page.
- [ ] Provide an English biography for the site and About page.
- [ ] Provide a short site description for metadata and social previews.
- [ ] Provide approved public social links, choosing only the accounts to show.
- [ ] Provide an optional public contact email for general enquiries.
- [ ] Provide a private security and code-of-conduct reporting channel.
- [ ] Review the author credit represented by `PUBLIC_SOCIAL_GITHUB`.
- [ ] Supply a logo or wordmark if the text identity should change.
- [ ] Supply a favicon and social sharing image, including ownership rights.

## Publishing content

- [ ] Approve or replace the current synthetic sample publications.
- [ ] Provide launch essays and research in `src/data/blog/zh-cn/`.
- [ ] Provide English versions in `src/data/blog/en/`, or confirm intentional
      one-language publication.
- [ ] Confirm publication timestamps and the `Asia/Shanghai` time zone.
- [ ] Decide which entries are drafts, scheduled or immediately public.
- [ ] Provide initial Notes, Projects, Research and Library entries.
- [ ] Define the first Garden topics and their intended relationships.
- [ ] Review every `uid`, `slug`, `previousSlugs`, `translationKey`, `topics`,
      maturity and relationship before the first public release.
- [ ] Confirm tags and their Chinese/English presentation.

## Pages and media

- [ ] Approve the Chinese and English About page copy.
- [ ] Provide current Now page copy.
- [ ] Supply Gallery images or confirm that only synthetic samples are public.
- [ ] Supply descriptive alt text for every meaningful image.
- [ ] Record creator, source URL, license and credit for every uploaded asset.
- [ ] Confirm the right to publish and modify every image, logo and font.
- [ ] Check that no private metadata, location or personal information remains
      in uploaded media.

## Domain and publication

- [ ] Confirm `https://zanezx.com/` as the production canonical origin.
- [ ] Confirm the Cloudflare account and approve the preview Worker.
- [ ] Approve the exact preview commit and artifact for production.
- [ ] Approve DNS binding of `zanezx.com`.
- [ ] Confirm `www.zanezx.com` behavior: redirect, alias or no binding.
- [ ] Approve the first public indexing date.
- [ ] Create the stable `v0.1.0` tag only after the preceding approvals.

## Repository governance

- [x] Keep the repository public.
- [x] Enable GitHub **Public template**.
- [x] Set the initial repository description, homepage and topics.
- [ ] Confirm the initial repository description and topics before launch.
- [ ] Confirm whether derivative users must replace the brand before deployment.
- [x] Enable GitHub private vulnerability reporting.
- [ ] Submit a non-destructive test report through the private security form.
- [x] Enable Dependabot alerts, automated security updates and pinned CI.

## How to edit later

Open a short-lived branch, make one focused change, run the documented checks,
and merge through a pull request after Linux and Windows CI pass.

Common locations:

| Change                      | Location                                                       |
| --------------------------- | -------------------------------------------------------------- |
| Site title, description     | `src/lib/site-settings.ts`                                     |
| Theme and feature switches  | `src/config.ts`                                                |
| Social and verification IDs | `.env`, based on `.env.example`                                |
| Chinese publications        | `src/data/blog/zh-cn/`                                         |
| English publications        | `src/data/blog/en/`                                            |
| About and Now               | `src/data/pages/{zh-cn,en}/`                                   |
| Gallery metadata and media  | `src/data/galleries/{zh-cn,en}/`                               |
| Frontmatter schema          | `src/content.config.ts`                                        |
| Routes and listings         | `src/pages/` and `src/lib/content/`                            |
| Skills and agent rules      | `.agents/skills/`, `AGENTS.md` and `docs/AGENT_ENVIRONMENT.md` |

For a publication URL change, keep the existing `uid` and `slug`, then append
the old public path to `previousSlugs`. Do not rename a translation key merely
because a title or folder changed.

Suggested change procedure:

```bash
git switch -c content/update-about
pnpm security:audit
pnpm skills:check
pnpm test
pnpm lint
pnpm format:check
pnpm build
pnpm test:e2e
git add .
git commit -m "content: update about page"
git push -u origin content/update-about
```

Open a pull request, wait for both CI jobs, review the preview artifact, and
merge. Production deployment remains a separate owner-approved workflow.
