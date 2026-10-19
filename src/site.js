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
