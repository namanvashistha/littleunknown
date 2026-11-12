# Chairside

Paediatric dental prescribing at littleunknown.com/chairside/: pick a diagnosis, enter the child's weight and age,
and get the AAPD-sourced dose with its working and the guideline wording. Installable PWA that works offline.

Svelte 5 + Vite + TypeScript, with vite-plugin-pwa (Workbox) scoped to `/chairside/`. It has its own
`package-lock.json`, separate from the Astro site.

```sh
npm install
npm run dev      # http://localhost:5173/chairside/
npm test         # dose engine and data integrity (node --test)
npm run check    # svelte-check
npm run build    # writes ../../public/chairside/, which astro build ships as-is
npm run icons    # redraw the app icons (needs the site's node_modules for @resvg/resvg-js)
```

- `src/lib/data.ts` is the only place doses live. Each number cites its source page; change it only against that page.
- `src/lib/engine.ts` turns a regimen and a patient into a dose. It's pure and covered by `engine.test.ts`.
- The site's `npm run build` runs these tests first, so a failing dose test stops the deploy.
- New guidance reaches installed copies as a "Reload" prompt, never a silent swap mid-prescription.
- The patient lives in sessionStorage only, so each launch starts with a blank weight.
