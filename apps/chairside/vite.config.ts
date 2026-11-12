import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

// Served at littleunknown.com/chairside/. The build lands in the Astro site's public/
// folder, so `astro build` copies it into the site as-is.
export default defineConfig({
  base: "/chairside/",
  build: { outDir: "../../public/chairside", emptyOutDir: true },
  plugins: [
    svelte(),
    VitePWA({
      // Clinical data changes ship as updates: ask before swapping, never mid-prescription.
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/chairside/",
        name: "Chairside — paediatric dental prescribing",
        short_name: "Chairside",
        description: "AAPD-sourced antibiotic, antifungal, antiviral and analgesic doses for children, worked out from weight and age. Works offline.",
        lang: "en",
        start_url: "/chairside/",
        scope: "/chairside/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FFFFFF",
        theme_color: "#121211",
        categories: ["medical", "health"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/chairside/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
