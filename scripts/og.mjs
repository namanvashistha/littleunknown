// Renders the social card and PNG icons into public/. Run with `npm run og`
// after changing the brand; the outputs are committed.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const fontDir = "@expo-google-fonts/jetbrains-mono";
const fontFiles = [
  require.resolve(`${fontDir}/400Regular/JetBrainsMono_400Regular.ttf`),
  require.resolve(`${fontDir}/500Medium/JetBrainsMono_500Medium.ttf`),
];

const ink = "#0f120f";
const text = "#e6ebe5";
const signal = "#4cc27a";
const graphite = "#8a948a";
const rule = "#262b26";
const font = "JetBrains Mono";

function render(svg, width, out) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: font },
  }).render().asPng();
  writeFileSync(new URL(`../public/${out}`, import.meta.url), png);
  console.log(`public/${out}`);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${ink}"/>
  <text x="80" y="104" font-family="${font}" font-size="26" fill="${graphite}">// product studio</text>
  <text x="76" y="330" font-family="${font}" font-weight="500" font-size="118" letter-spacing="-4" fill="${text}">little_unknown<tspan fill="${signal}">_</tspan></text>
  <text x="80" y="404" font-family="${font}" font-size="38" fill="${graphite}">// everything starts unknown</text>
  <line x1="80" y1="510" x2="1120" y2="510" stroke="${rule}" stroke-width="2"/>
  <text x="80" y="560" font-family="${font}" font-size="26" fill="${graphite}">littleunknown.com</text>
</svg>`;

// Square mark: a monospace "l" and the green cursor.
const icon = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad ? 0 : 112}" fill="${ink}"/>
  <text x="${pad ? 150 : 118}" y="${pad ? 330 : 350}" font-family="${font}" font-weight="500" font-size="${pad ? 220 : 280}" fill="${text}">l</text>
  <rect x="${pad ? 270 : 262}" y="${pad ? 304 : 318}" width="${pad ? 100 : 136}" height="${pad ? 30 : 40}" fill="${signal}"/>
</svg>`;

render(og, 1200, "og.png");
render(icon(false), 512, "icon-512.png");
render(icon(false), 192, "icon-192.png");
render(icon(true), 180, "apple-touch-icon.png");
render(icon(false), 32, "favicon-32.png");
