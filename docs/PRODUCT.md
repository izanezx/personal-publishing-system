# Personal Publishing System

The reference study in the original template-selection conversation
informs the editorial layout and publishing workflow. Tom Critchlow's
Writing, Library and Wiki inform the site navigation. Maggie Appleton's
Garden informs topic pages, maturity and reciprocal links. Simon
Willison's mixed publishing formats inform the two dated feeds. Suganthan's
editorial home informs the sections for research, notes and projects.
Josh W. Comeau's interactive writing informs demonstrations embedded in
otherwise readable articles.

## Routes and content

| Section       | Route              | Editorial rule                                                                         |
| ------------- | ------------------ | -------------------------------------------------------------------------------------- |
| Home          | `/`                | Editorial index, featured and recent publications, recent activity and a visual record |
| Writing       | `/posts/`          | Publications ordered by first publication; tags and archives provide additional paths  |
| Research      | `/research/`       | Publications in the research topic, including technical MDX demonstrations             |
| Notes         | `/notes/`          | Short records and observations                                                         |
| Projects      | `/projects/`       | Work in progress, experiments and completed projects                                   |
| Garden        | `/garden/`         | Publications grouped by topic and displayed by maturity                                |
| Library       | `/library/`        | Curated resources and links                                                            |
| Gallery       | `/galleries/`      | Photo essays or visual studies with credit and alt text                                |
| About and Now | `/about/`, `/now/` | Profile and an editable status page in the pages collection                            |

The same sections are available under `/en/`. Publish each translation
independently. The Garden hierarchy is a view of the shared content model
and supports `seedling`, `budding` and `evergreen`. Use `related` for a
reference and `evolvedFrom` when a publication develops an earlier idea.
Visible outgoing links and backlinks connect those records by UID.

## Reading and presentation

The site uses Devosfera's typography, layout widths, color variables and
light/dark modes. The home index uses a responsive grid, the activity stream
uses an ordered timeline, and the gallery shelf reuses gallery cards.
Articles use the existing prose style and reading preferences. The motion
preference persists locally and honors the system's reduced-motion setting.
Interactive demonstrations use Astro components inside MDX. Both tabs'
contents remain readable when scripting is unavailable.

The technical comparison in the original conversation recorded a shared
logic prototype with two collection adapters and 14 automated checks.
This site implements the chosen Devosfera-based architecture. Its acceptance
suite exercises real routes, static artifacts and Chromium. For a future
article that specifically needs a React or Sandpack editor, add the
integration in a scoped change and rerun the OG, performance and browser
checks. The studio website, the final visual identity and owner content
each have their own delivery decisions.
