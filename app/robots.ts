import type { MetadataRoute } from "next";

/** Production origin for robots.txt (not preview / localhost). */
const BASE = "https://tekcroft.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
