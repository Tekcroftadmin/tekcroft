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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((path) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/blog") || path === "/contact" ? 0.7 : 0.8,
  }));
}
