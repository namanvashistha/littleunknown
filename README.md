# littleunknown.com

The site for little unknown, built with [Astro](https://astro.build) and deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

```sh
npm install
npm run dev     # local dev server
npm run build   # static site in dist/
npm run brand   # regenerate the logo kit, favicons, app icons and og.png
```

- Studio facts used for SEO, JSON-LD and `llms.txt` live in `src/site.js`; keep `public/llms.txt` in step with them.
- Every page goes through `src/layouts/Base.astro`, which renders `src/components/Seo.astro`.
- Blog posts are MDX files in `src/content/blog/` (frontmatter: `title`, `description`, `createdAt`, optional `updatedAt`, `tags`, `draft`). The file name is the URL; posts appear on `/blog/`, in `/rss.xml` and the sitemap.
- Brand rules: [BRAND.md](BRAND.md).
