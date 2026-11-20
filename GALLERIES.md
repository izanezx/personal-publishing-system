# Galleries

Store gallery entries under `src/data/galleries/zh-cn/` or `src/data/galleries/en/`.
Each gallery directory contains `index.md` and its images. Declare a unique
`uid`, a stable public `slug`, a title, description and publication date.
Set a shared `translationKey` on corresponding translations.

Add `<GalleryEmbed slug="color-study" limit={2} />` to an MDX article to embed
a publicly published gallery in the article language. Each embed has an
independent lightbox. Use descriptive image filenames so the generated
alternative text makes sense.

Only publish images that you have permission to use. The current color study
uses synthetic samples for testing.
