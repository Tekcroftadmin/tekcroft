import type { MetadataRoute } from "next";

const BASE = "https://www.tekcroft.com";

const routes = [
  "/",
  "/about-us",
  "/services",
  "/blog",
  "/contact",
  "/book-a-free-evaluation",
  "/privacy-policy",
  "/terms-of-use",
  "/accessibility",
  "/sitemap",
  "/seo-services",
  "/ecommerce-seo-services",
  "/seo-audit-services",
  "/on-page-seo-services",
  "/technical-seo-services",
  "/ai-seo-services",
  "/local-seo-services",
  "/google-business-profile-optimization-services",
  "/franchise-seo-services",
  "/web-and-app-development-services",
  "/web-design-and-development-services",
  "/custom-software-development-services",
  "/mobile-app-development-services",
  "/artificial-intelligence-services",
  "/ai-development-services",
  "/ai-chatbot-development-services",
  "/ai-agent-development-services",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/blog") || path === "/contact" ? 0.7 : 0.8,
  }));
}
