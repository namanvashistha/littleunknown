// Facts about the studio, used by every page's SEO tags, JSON-LD and llms.txt.
// Keep these plain and true: search engines and AI answer engines quote them.
export const site = {
  name: "little unknown",
  wordmark: "little_unknown_",
  url: "https://littleunknown.com",
  tagline: "everything starts unknown",
  manifesto: "We turn little unknowns into products people rely on.",
  description:
    "little unknown is a product studio founded by Naman Vashistha. It designs, builds and ships apps and software products for the web, mobile and the browser.",
  founder: {
    name: "Naman Vashistha",
    url: "https://namanvashistha.com",
    sameAs: ["https://github.com/namanvashistha", "https://namanvashistha.com"],
  },
  locale: "en",
};

// Products shown on the home page and described in JSON-LD and llms.txt.
export const products = [
  {
    slug: "calm-chess",
    name: "Calm Chess",
    subtitle: "A kind coach beside you",
    summary: "Learn chess without the noise. A kind coach explains every move.",
    description:
      "Calm Chess is chess without the pressure. Play the Rookie, the Master or the Grandmaster, or pass the phone to a friend. After every move a kind coach says, in plain words, whether it was great, good or a slip, and why.",
    features: [
      ["a coach, not a critic", "every move explained in plain words, never scolded"],
      ["see the game", "lines of light show where a piece can go, and what guards it"],
      ["private by design", "no account, no ads, no tracking; the engine runs offline on your phone"],
      ["for everyone", "in english, hindi and spanish, in light and dark"],
    ],
    platforms: ["iPhone", "Android"],
    status: "coming to the App Store and Google Play",
    url: "https://namanvashistha.com/chess/cozychess/",
    category: "GameApplication",
    languages: ["en", "hi", "es"],
  },
];

const org = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  alternateName: site.wordmark,
  url: `${site.url}/`,
  logo: { "@type": "ImageObject", url: `${site.url}/icon-512.png`, width: 512, height: 512 },
  image: `${site.url}/og.png`,
  slogan: site.tagline,
  description: site.description,
  founder: { "@id": `${site.url}/#founder` },
};

const founder = {
  "@type": "Person",
  "@id": `${site.url}/#founder`,
  name: site.founder.name,
  url: site.founder.url,
  sameAs: site.founder.sameAs,
  worksFor: { "@id": `${site.url}/#organization` },
};

const website = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: `${site.url}/`,
  name: site.name,
  alternateName: site.wordmark,
  description: site.description,
  inLanguage: site.locale,
  publisher: { "@id": `${site.url}/#organization` },
};

// The graph every page carries; pages add their own WebPage node on top.
export const baseGraph = [org, founder, website];

export const productGraph = products.map((p) => ({
  "@type": "MobileApplication",
  "@id": `${site.url}/#${p.slug}`,
  name: p.name,
  alternativeHeadline: p.subtitle,
  description: p.description,
  url: p.url,
  image: `${site.url}/products/${p.slug}.png`,
  applicationCategory: p.category,
  applicationSubCategory: "Board game",
  operatingSystem: "iOS, Android",
  inLanguage: p.languages,
  isAccessibleForFree: true,
  author: { "@id": `${site.url}/#organization` },
  publisher: { "@id": `${site.url}/#organization` },
}));
