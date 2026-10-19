import rss from "@astrojs/rss";
import { site } from "../site.js";
import { posts } from "../lib/blog";

export async function GET(context) {
  const list = await posts();
  return rss({
    title: `${site.name} blog`,
    description: `Posts from ${site.name} about the products it makes.`,
    site: context.site,
    items: list.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.createdAt,
      link: `/blog/${post.id}/`,
    })),
    customData: "<language>en</language>",
  });
}
