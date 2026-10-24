// Generates every logo file from the brand definition in src/lib/mark.js:
// the downloadable logo kit in public/brand/, the favicons and app icons, and
// the social card. Text is converted to outlines, so no file depends on a font
// being installed. Run with `npm run brand` after changing the logo; the
// outputs are committed.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";
import { circles, colors as c, PATTERN, PATTERN_SMALL } from "../src/lib/mark.js";
import { social } from "../src/lib/social.js";

const require = createRequire(import.meta.url);
const font = (file) => {
  const buf = readFileSync(require.resolve(`@expo-google-fonts/jetbrains-mono/${file}`));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const bold = font("700Bold/JetBrainsMono_700Bold.ttf");
const medium = font("500Medium/JetBrainsMono_500Medium.ttf");
const regular = font("400Regular/JetBrainsMono_400Regular.ttf");

const pub = (p) => new URL(`../public/${p}`, import.meta.url);
mkdirSync(pub("brand"), { recursive: true });
const write = (p, data) => { writeFileSync(pub(p), data); console.log(`public/${p}`); };
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

// Text as one outlined path. x, y is the start of the baseline; tracking in em.
function text(f, str, x, y, size, tracking = 0) {
  const scale = size / f.unitsPerEm;
  let pen = x;
  let d = "";
  for (const ch of str) {
    const glyph = f.charToGlyph(ch);
    d += glyph.getPath(pen, y, size).toPathData(2);
    pen += glyph.advanceWidth * scale + tracking * size;
  }
  return d;
}

// Where CSS puts the baseline in a line-height: 1 box, as a fraction of the font size.
const baseline = (f) => (1 - (f.ascender - f.descender) / f.unitsPerEm) / 2 + f.ascender / f.unitsPerEm;

// The wordmark at font size F, its box's top-left at (x, y). Mirrors .wordmark in global.css.
function wordmark(F, x, y, ink, accent) {
  const big = text(bold, "unknown", x, y + baseline(bold) * F, F, -0.04);
  const s = 0.27 * F;
  const little = text(medium, "little", x + 0.05 * F, y - 0.035 * F + baseline(medium) * s, s);
  return { svg: `<path d="${big}" fill="${ink}"/><path d="${little}" fill="${accent}"/>`, width: 7 * 0.56 * F, height: F };
}

const mark = (size, x, y, ink, accent, pattern = PATTERN) =>
  `<g>${circles(pattern, { ink, accent, scale: size / 100, dx: x, dy: y })}</g>`;

// Bounding box of the drawn content, so files can be cropped tight with even padding.
function crop(inner, box, pad) {
  const [x0, y0, x1, y1] = box;
  const w = x1 - x0 + pad * 2;
  const h = y1 - y0 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - pad} ${y0 - pad} ${w.toFixed(1)} ${h.toFixed(1)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}">${inner}</svg>`;
}

// Dots occupy x 8–92 and, for the 3-row band, y 31–69 of the 100 box.
const MARK_BOX = { x0: 8, x1: 92, y0: 31.04, y1: 68.96 };

function lockupSvg(ink, accent, bg) {
  const F = 100;
  const m = 1.5 * F;
  const wm = wordmark(F, m + 0.42 * F, 0.25 * F, ink, accent);
  const inner = mark(m, 0, 0, ink, accent) + wm.svg;
  const box = [(MARK_BOX.x0 / 100) * m, 0.25 * F - 0.08 * F, m + 0.42 * F + wm.width, 0.25 * F + F * 1.08];
  return crop((bg ? `<rect x="-999" y="-999" width="9999" height="9999" fill="${bg}"/>` : "") + inner, box, 40);
}

function wordmarkSvg(ink, accent, bg) {
  const F = 100;
  const wm = wordmark(F, 0, 0, ink, accent);
  return crop((bg ? `<rect x="-999" y="-999" width="9999" height="9999" fill="${bg}"/>` : "") + wm.svg, [0, -0.06 * F, wm.width, F * 1.08], 40);
}

function markSvg(ink, accent, bg) {
  const inner = (bg ? `<rect x="-999" y="-999" width="9999" height="9999" fill="${bg}"/>` : "") + mark(100, 0, 0, ink, accent);
  return crop(inner, [MARK_BOX.x0, MARK_BOX.y0 - 4, MARK_BOX.x1, MARK_BOX.y1 + 4], 8);
}

// App icon: the mark on night, filling 78% of the square.
const appIcon = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${radius}" fill="${c.night}"/>${mark(78, 11, 11, c.moon, c.vermilion)}</svg>`;

// --- the logo kit ---
const kit = {
  "lockup-light": lockupSvg(c.ink, c.vermilion),
  "lockup-dark": lockupSvg(c.moon, c.vermilion),
  "lockup-on-vermilion": lockupSvg("#ffffff", c.night),
  "wordmark-light": wordmarkSvg(c.ink, c.vermilion),
  "wordmark-dark": wordmarkSvg(c.moon, c.vermilion),
  "mark-light": markSvg(c.ink, c.vermilion),
  "mark-dark": markSvg(c.moon, c.vermilion),
};
for (const [name, svg] of Object.entries(kit)) {
  write(`brand/little-unknown-${name}.svg`, svg);
  write(`brand/little-unknown-${name}.png`, png(svg, 2000));
}
write("brand/little-unknown-app-icon.png", png(appIcon(1024, 0), 1024));

// --- favicons and icons ---
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.k{fill:${c.ink}}@media (prefers-color-scheme:dark){.k{fill:${c.moon}}}</style>${circles(PATTERN_SMALL, { accent: c.vermilion }).replaceAll('fill="currentColor"', 'class="k"')}</svg>\n`);
const tiny = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${c.night}"/>${circles(PATTERN_SMALL, { ink: c.moon, accent: c.vermilion, scale: 0.84, dx: 8, dy: 8 })}</svg>`;
write("favicon-32.png", png(tiny, 32));
write("apple-touch-icon.png", png(appIcon(180, 0), 180));
write("icon-192.png", png(appIcon(192, 0), 192));
write("icon-512.png", png(appIcon(512, 0), 512));
write("brand/little-unknown-favicon.svg", tiny);

// --- the social card ---
const og = (() => {
  const F = 120;
  const m = 1.5 * F;
  const x = 80;
  const y = 250;
  const wm = wordmark(F, x + m + 0.42 * F, y + 0.25 * F, c.moon, c.vermilion);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${c.night}"/>
  <path d="${text(regular, "// product studio", 80, 104, 26)}" fill="#7d877d"/>
  ${mark(m, x - (MARK_BOX.x0 / 100) * m, y, c.moon, c.vermilion)}${wm.svg}
  <path d="${text(regular, "// everything starts unknown", 80, 470, 30)}" fill="#7d877d"/>
  <rect x="80" y="520" width="1040" height="2" fill="#262b26"/>
  <path d="${text(medium, "littleunknown.com", 80, 572, 24)}" fill="#7d877d"/>
</svg>`;
})();
write("og.png", png(og, 1200));

// --- social banners ---
// One per profile surface, light (paper) and dark (night). The lockup sits centred, which keeps
// it clear of the avatar LinkedIn and X overlay on the lower left, with the tagline under it.
// Lockup proportions at font size 1: total width, and height from the top of "little" to the baseline area.
const LOCKUP_W = 1.5 + 0.42 + 7 * 0.56;
const LOCKUP_H = 1.14;
function banner(w, h, theme) {
  const [bg, ink, quiet] = theme === "dark" ? [c.night, c.moon, "#7d877d"] : [c.paper, c.ink, c.graphite];
  // YouTube shows only the middle 1546 × 423 on every device, so size against that safe area.
  const [sw, sh] = w === 2560 ? [1546, 423] : [w, h];
  const F = Math.min((sw * (h >= w ? 0.8 : 0.62)) / LOCKUP_W, (sh * 0.42) / LOCKUP_H);
  const m = 1.5 * F;
  const tag = Math.max(14, F * 0.24);
  const blockH = LOCKUP_H * F + tag * 2.6;
  const x = (w - LOCKUP_W * F) / 2 - (MARK_BOX.x0 / 100) * m;
  const y = (h - blockH) / 2;
  const wm = wordmark(F, x + m + 0.42 * F, y + 0.06 * F + 0.25 * F, ink, c.vermilion);
  const tagline = "// everything starts unknown";
  const tagW = tagline.length * 0.6 * tag;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${mark(m, x, y + 0.06 * F, ink, c.vermilion)}${wm.svg}
  <path d="${text(regular, tagline, (w - tagW) / 2, y + LOCKUP_H * F + tag * 2.3, tag)}" fill="${quiet}"/>
</svg>`;
}
mkdirSync(pub("brand/social"), { recursive: true });
for (const [name, w, h] of social) {
  for (const theme of ["light", "dark"]) {
    write(`brand/social/little-unknown-${name}-${theme}.png`, png(banner(w, h, theme), w));
  }
}
