# Third-party notices

The project begins with Devosfera and AstroPaper. The original MIT copyright
notices are retained in LICENSE. The exact references are in
UPSTREAM_BASELINES.md. AstroWind (MIT, copyright 2023 onWidget) was
reviewed as an engineering and component reference. The local components
were implemented for this site.

The Open Graph renderer uses Noto Sans CJK SC from
[notofonts/noto-cjk](https://github.com/notofonts/noto-cjk/tree/main/Sans).
The SIL Open Font License is included in
`src/assets/fonts/NotoSansCJK-LICENSE.txt`.

The active site uses system UI fonts. The original Wotfard fonts, streaming
audio, demonstration biographies, galleries and stock material are excluded
from the current site assets. The color samples and publication fixtures are
synthetic.

Project Agent skills are vendored under `.agents/skills/`. Their exact upstream
repositories, paths and commit revisions are recorded in `skills-lock.json`;
license and notice files are retained inside each Skill directory. Known
upstream sources include mattpocock/skills, astrolicious/agent-skills,
addyosmani/web-quality-skills, delineas/astro-framework-agents, openai/skills
cloudflare/skills and sveltia/ai-tools.

The Sveltia CMS authenticator is vendored under `infra/sveltia-auth/` from
[sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) at
revision `e62e76ae5ca4dd28e751607b331bb47bb1feddfe`. Its MIT license and
source record are retained in that directory.
