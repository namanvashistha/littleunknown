// Draws the Chairside app icons into public/. Run with `npm run icons` after changing the mark.
// The mark is the diagnosis list itself: four rows, each with its verdict bar.
// Uses @resvg/resvg-js from the littleunknown site's devDependencies.
import { writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const INK = "#121211", PAPER = "#F2F1EC";
const ROWS = ["#D13A1C", "#0F6B45", "#E0A838", PAPER];

// `inset` is the share of the square the mark fills: maskable icons keep it inside the 80% safe zone.
function svg(size, inset, { round = 0 } = {}) {
  const s = size, m = (s * (1 - inset)) / 2, w = s - 2 * m;
  const rowH = w / 4, gap = rowH * 0.32, barW = w * 0.075;
  const rows = ROWS.map((c, i) => {
    const y = m + i * rowH + gap / 2, h = rowH - gap;
    const lineW = w - barW * 2.4 - (i % 2 ? w * 0.18 : 0);
    return `<rect x="${m}" y="${y}" width="${barW}" height="${h}" fill="${c}"/>` +
      `<rect x="${m + barW * 2.4}" y="${y + h * 0.36}" width="${lineW}" height="${h * 0.28}" fill="${PAPER}" opacity="${i === 3 ? 0.35 : 0.9}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">` +
    `<rect width="${s}" height="${s}" rx="${round}" fill="${INK}"/>${rows}</svg>`;
}

const png = (s, size) => new Resvg(s, { fitTo: { mode: "width", value: size } }).render().asPng();

writeFileSync("public/favicon.svg", svg(64, 0.72, { round: 12 }));
writeFileSync("public/icon-192.png", png(svg(192, 0.62), 192));
writeFileSync("public/icon-512.png", png(svg(512, 0.62), 512));
writeFileSync("public/icon-maskable-512.png", png(svg(512, 0.5), 512));
writeFileSync("public/apple-touch-icon.png", png(svg(180, 0.6), 180));
console.log("icons written to public/");

// The product icon on littleunknown.com (home page, links page, JSON-LD image).
writeFileSync("../../src/assets/chairside/icon.png", png(svg(1024, 0.62), 1024));
writeFileSync("../../public/products/chairside.png", png(svg(512, 0.62), 512));
console.log("site product icons written");
