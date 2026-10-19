import { getCollection } from "astro:content";

// Published posts, newest first. Drafts stay out of every page, the feed and the sitemap.
export async function posts() {
  const all = await getCollection("blog", ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.createdAt.valueOf() - a.data.createdAt.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// About 220 words a minute, rounded up.
export const readingMinutes = (body = "") => Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 220));
