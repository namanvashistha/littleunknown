# little unknown — brand

## Idea

We turn little unknowns into products people rely on.

little unknown is an umbrella for the apps and products we build.
The name is the starting point, not the size: every product begins as an open
question, an idea nobody has proven yet. little unknown is where those questions
are explored, built and shipped until they become products people rely on.

"Little" is the seed, never the ambition. Never describe the products as small,
minor or side projects, and never sound like we are just getting started:
speak as a studio with a track record, in the present tense.

Three ideas sit underneath it:

- **Curiosity.** Not knowing is the starting point, not something to hide.
- **Making as thinking.** We find answers by building, not by waiting for certainty.
- **Seriousness.** Unknowns get taken seriously, and what ships is built to last.

## Logo

The public brand page with every mockup and the logo files is
[littleunknown.com/brand](https://littleunknown.com/brand/).

- **Mark:** a band of 6 × 3 dots. The known dots are ink; three are lit in
  vermilion, the little unknowns. Below 24px use the simplified 3 × 2 mark with
  one lit dot (the favicon).
- **Wordmark:** "unknown" in JetBrains Mono Bold, with "little" in Medium at
  27% size, vermilion, tucked into the empty space above "un".
- **Lockup:** the mark at 1.5× the wordmark's size, then the wordmark.
- **Motion:** on screen the lit dots may pulse gently, one at a time. The brand
  page shows the motion set, all built from the dots in ink and vermilion:
  the sting (the logo builds in about three seconds), loop, transition, loader,
  discovery, ripple, connect, ship, tagline and small sizes. They live in
  `LogoSting.astro`, `DotWave.astro` and `BrandMotion.astro`, and every one shows
  a still frame when motion is reduced.
- **Source of truth:** `src/lib/mark.js` (pattern and colours) and the
  `.wordmark` rules in `src/styles/global.css`. `npm run brand` regenerates the
  logo kit in `public/brand/`, the favicons, app icons and `og.png`.

## Lines

- **Tagline:** `// everything starts unknown`
- **Manifesto:** We turn little unknowns into products people rely on.
- **Principles:** question everything. build to find out. ship what matters.

Write the name as **little unknown** in running text: lowercase, two words.

## Look

Field notes: a builder's lab notebook. Monospace, plain surfaces, one signal colour.

| Token  | Light     | Dark      | Use                                      |
|--------|-----------|-----------|------------------------------------------|
| paper  | `#eef0ec` | `#0f120f` | background                               |
| ink    | `#121512` | `#e6ebe5` | text, the known dots                     |
| signal | `#ef4b2b` | `#ef4b2b` | vermilion: the lit dots, "little", accent |
| link   | `#bf3618` | `#ff6a4a` | links and small vermilion text (AA)      |
| graphite | `#5b625b` | `#8a948a` | comments, secondary text               |
| rule   | `#d5dad3` | `#262b26` | hairlines                                |

- **Type:** JetBrains Mono (400, 500, 700) for the logo, headings, labels and `//` comments; IBM Plex Sans (400, 500) for paragraphs and anything read at length.
- **Vermilion is rare.** The lit dots, "little", links and one accent per view;
  never large fills except the one-colour logo panel.
- **Comments are a voice.** Secondary lines start with `//` in graphite.
- **No decoration.** No gradients, shadows, illustrations or stock imagery.

## Voice

Write the way you'd explain it to a friend. Keep sentences short and say what a
thing does. Say each thing once, in one place on the site. Lowercase is fine for
labels. Avoid hype words (revolutionary, seamless, empower), "not X but Y" turns,
dramatic colons and lists of three where one word would do.
