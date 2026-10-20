// Facts about the studio, used by every page's SEO tags, JSON-LD and llms.txt.
// Keep these plain and true: search engines and AI answer engines quote them.
export const site = {
  name: "little unknown",
  url: "https://littleunknown.com",
  tagline: "everything starts unknown",
  manifesto: "We turn little unknowns into products people rely on.",
  // One plain sentence about what the studio is. Pages say more in their own words.
  description: "little unknown is a product studio that makes apps for iPhone, Android and the web.",
  locale: "en",
};

// Products shown on the home page and described in JSON-LD and llms.txt.
export const products = [
  {
    slug: "calm-chess",
    name: "Calm Chess",
    subtitle: "A kind coach beside you",
    summary: "Learn chess without the pressure.",
    description:
      "Play the Rookie, the Master or the Grandmaster, or pass the phone to a friend. After each move, the coach tells you whether it was great, good or a slip, and why.",
    platforms: ["iPhone", "Android"],
    status: "coming to the App Store and Google Play",
    url: `${site.url}/blog/calm-chess/`,
    category: "GameApplication",
    languages: ["en", "hi", "es"],
  },
];

const org = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: `${site.url}/`,
  logo: { "@type": "ImageObject", url: `${site.url}/icon-512.png`, width: 512, height: 512 },
  image: `${site.url}/og.png`,
  slogan: site.tagline,
  description: site.description,
};

const website = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: `${site.url}/`,
  name: site.name,
  description: site.description,
  inLanguage: site.locale,
  publisher: { "@id": `${site.url}/#organization` },
};

// The graph every page carries; pages add their own WebPage node on top.
export const baseGraph = [org, website];

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
