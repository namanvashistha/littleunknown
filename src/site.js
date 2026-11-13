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
  // Umami Cloud website ID for littleunknown.com. Public, not a secret. Empty means no analytics script.
  umamiWebsiteId: "76a70c42-04ea-47ba-972b-2d569a1379d9",
};

// Waitlist sign-ups go straight into the Supabase table `waitlist` (see
// supabase/waitlist.sql): the public key can only add a row,
// never read one. Empty key means the forms fall back to an email link.
export const waitlist = {
  url: "https://zjqkjrbfwzitsiwxqhsa.supabase.co/rest/v1/waitlist",
  key: "sb_publishable_60cMOrqGGxQ1z1yOrVxCwA_aNWpUNQv",
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
    status: "on the App Store, coming to Google Play",
    // When set, the bio links send people here (appStore first, then a public TestFlight beta)
    // instead of the waitlist. The App Store link has no country, so it opens each viewer's own store.
    appStore: "https://apps.apple.com/app/id6823705560",
    // The bio links open the Instagram custom product page instead (same app, screenshots that match the reels),
    // so App Store Connect counts installs that came from Instagram.
    bioLink: "https://apps.apple.com/app/id6823705560?ppid=87acf7f2-2ae3-44b3-98d8-681fb511e551",
    url: `${site.url}/blog/calm-chess/`,
    category: "GameApplication",
    subCategory: "Board game",
    operatingSystem: "iOS, Android",
    languages: ["en", "hi", "es"],
  },
  {
    slug: "einbuergerungstest",
    name: "Einbürgerungstest: Leben in DE",
    shortName: "Einbürgerungstest",
    nameLang: "de",
    subtitle: "No ads · 310 questions",
    summary: "Pass the German citizenship test, in your own language.",
    description:
      "All 310 questions of the “Leben in Deutschland” test and the Einbürgerungstest, in German as in the exam and in your own language underneath. Mock tests in the real format and an estimate of your score today. No ads, no account, no subscription.",
    platforms: ["iPhone", "iPad"],
    status: "coming to the App Store",
    url: `${site.url}/blog/einbuergerungstest/`,
    category: "EducationalApplication",
    subCategory: "Test preparation",
    operatingSystem: "iOS, iPadOS",
    languages: ["de", "en", "uk", "ru", "tr", "ar", "fa", "pl", "ro", "bg", "el", "it", "sq", "hr", "bs", "es", "fr", "pt", "hi", "ur", "vi", "zh-Hans"],
  },
  {
    slug: "lazy-gym-buddy",
    name: "Lazy Gym Buddy",
    subtitle: "A panda who won't go alone",
    summary: "A panda who loves working out, but won't go alone.",
    description:
      "Bao the panda is on the sofa, and he only gets up if you do. Work out together, tap when you're done, and he naps like he earned it. Workouts from Apple Health count too, including ones tracked on an Apple Watch. No streaks, no ads, no account.",
    platforms: ["iPhone"],
    status: "coming to the App Store",
    url: `${site.url}/blog/lazy-gym-buddy/`,
    category: "HealthApplication",
    subCategory: "Fitness",
    operatingSystem: "iOS",
    languages: ["en"],
  },
  {
    slug: "chairside",
    name: "Chairside",
    subtitle: "Children's dental prescribing",
    summary: "The right dose for a child, worked out at the chair.",
    description:
      "For dentists treating children. Pick the diagnosis and Chairside says whether a drug is indicated at all, then works out the dose from the child's weight and age, with the maximums applied, the volume of each syrup, the working shown and the AAPD guideline wording quoted. Penicillin allergy and age gates withhold what a child can't have. Free, no account, works offline.",
    platforms: ["Web"],
    status: "free on the web",
    // Opens the app itself: it runs in the browser and installs from there.
    web: `${site.url}/chairside/`,
    url: `${site.url}/chairside/`,
    type: "WebApplication",
    category: "MedicalApplication",
    subCategory: "Dental prescribing",
    operatingSystem: "Any (web browser)",
    languages: ["en"],
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
  "@type": p.type ?? "MobileApplication",
  "@id": `${site.url}/#${p.slug}`,
  name: p.name,
  alternativeHeadline: p.subtitle,
  description: p.description,
  url: p.url,
  image: `${site.url}/products/${p.slug}.png`,
  applicationCategory: p.category,
  applicationSubCategory: p.subCategory,
  operatingSystem: p.operatingSystem,
  inLanguage: p.languages,
  isAccessibleForFree: true,
  author: { "@id": `${site.url}/#organization` },
  publisher: { "@id": `${site.url}/#organization` },
}));
