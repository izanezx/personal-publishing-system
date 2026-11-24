# Galleries

Store entries in `src/data/galleries/zh-cn/` or `src/data/galleries/en/`.
Each gallery has an `index.md` and its images. Declare a unique `uid`, a
stable public `slug`, a title, description and publication date. Set a
shared `translationKey` on the two published versions of the same gallery.

Add one `media` entry for each image. Order the entries as they should be
read and write alt text in the gallery's language.

```yaml
media:
  - src: ./blue.jpg
    alt: Dark blue swatch with a fine textured finish
    credit: zanezx
    license: CC BY 4.0
    source: https://example.com/blue
```

Credit, license and source can be omitted when they do not apply. Only
publish images you have permission to use. The current color-study images
are synthetic samples used by the browser checks.

Add `<GalleryEmbed slug="color-study" limit={2} />` to an MDX article for a
gallery that is public in the article's language. Each embed has an
independent lightbox and uses the supplied text alternatives.
