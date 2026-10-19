// The little unknown mark: a band of known dots with three little unknowns lit.
// Shared by the site (Mark.astro) and the asset generator (scripts/brand.mjs).

// o = known dot, a = lit dot
export const PATTERN = ["ooaooo", "oooaoo", "oaoooo"];
// At favicon sizes the band is simplified to 3 x 2 with one lit dot.
export const PATTERN_SMALL = ["oao", "ooo"];

export const colors = {
  paper: "#eef0ec",
  ink: "#121512",
  night: "#0f120f",
  moon: "#e6ebe5",
  vermilion: "#ef4b2b",
  vermilionDeep: "#bf3618",
  vermilionBright: "#ff6a4a",
  graphite: "#5b625b",
  rule: "#d5dad3",
};

// Dot centres and radius in a 100 x 100 box.
export function dots(pattern = PATTERN) {
  const rows = pattern.length;
  const cols = pattern[0].length;
  const step = 84 / cols;
  const r = step * 0.36;
  const ox = 50 - ((cols - 1) * step) / 2;
  const oy = 50 - ((rows - 1) * step) / 2;
  const out = [];
  pattern.forEach((row, y) =>
    [...row].forEach((ch, x) => out.push({ cx: ox + x * step, cy: oy + y * step, r, lit: ch === "a" })),
  );
  return out;
}

// The circles as SVG markup. With no colours given, known dots take
// currentColor and lit dots get class "acc" so CSS can colour them.
export function circles(pattern = PATTERN, { ink, accent, scale = 1, dx = 0, dy = 0 } = {}) {
  const f = (n) => +(n * scale).toFixed(2);
  let n = 0;
  return dots(pattern)
    .map(({ cx, cy, r, lit }) => {
      const pos = `cx="${f(cx) + dx}" cy="${f(cy) + dy}" r="${f(r)}"`;
      if (lit) return accent ? `<circle ${pos} fill="${accent}"/>` : `<circle class="acc" style="--n:${n++}" ${pos}/>`;
      return `<circle ${pos} fill="${ink ?? "currentColor"}"/>`;
    })
    .join("");
}
