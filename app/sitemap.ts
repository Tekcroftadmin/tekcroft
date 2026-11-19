import type { MetadataRoute } from "next";
import { getAllPostSlugs, getCategories, getPublicSiteUrl } from "@/lib/wordpress";

const BASE = getPublicSiteUrl();

const routes = [
  "/",
  "/about-us",
  "/services",
  "/blog",
  "/contact-us",
  "/book-a-free-evaluation",
  "/privacy-policy",
  "/terms-of-use",
  "/accessibility",
  "/sitemap",
  "/services/seo-services",
  "/services/ecommerce-seo-services",
  "/services/seo-audit-services",
  "/services/on-page-seo-services",
  "/services/technical-seo-services",
  "/services/ai-seo-services",
  "/services/local-seo-services",
  "/services/google-business-profile-optimization-services",
  "/services/franchise-seo-services",
  "/services/web-and-app-development-services",
  "/services/web-design-and-development-services",
  "/services/custom-software-development-services",
  "/services/mobile-app-development-services",
  "/services/artificial-intelligence-services",
  "/services/ai-development-services",
  "/services/ai-chatbot-development-services",
  "/services/ai-agent-development-services",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path.startsWith("/blog") || path === "/contact-us"
          ? 0.7
          : 0.8,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    const posts = await getAllPostSlugs();
    postEntries = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.modified ? new Date(p.modified) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    postEntries = [];
  }

  try {
    const cats = await getCategories();
    categoryEntries = cats
      .filter((c) => (c.count || 0) > 0 && c.slug !== "uncategorized")
      .map((c) => ({
        url: `${BASE}/blog/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
  } catch {
    categoryEntries = [];
  }

  return [...staticEntries, ...postEntries, ...categoryEntries];
}
