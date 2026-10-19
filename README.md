# littleunknown.com

The site for little unknown, built with [Astro](https://astro.build) and deployed to
GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

```sh
npm install
npm run dev     # local dev server
npm run build   # static site in dist/
npm run og      # re-render public/og.png and the PNG icons after a brand change
```

- Studio facts used for SEO, JSON-LD and `llms.txt` live in `src/site.js`; keep `public/llms.txt` in step with them.
- Every page goes through `src/layouts/Base.astro`, which renders `src/components/Seo.astro`.
- Brand rules: [BRAND.md](BRAND.md).
