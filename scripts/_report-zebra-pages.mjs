import fs from "fs";
import path from "path";

const map = {
  "homepage-body.html": ["Home", "/"],
  "about-us-body.html": ["About us", "/about-us"],
  "contact-body.html": ["Contact us", "/contact-us"],
  "services-body.html": ["Services hub", "/services"],
  "seo-services-body.html": ["SEO Services", "/services/seo-services"],
  "ecommerce-seo-body.html": ["Ecommerce SEO", "/services/ecommerce-seo-services"],
  "seo-audit-services-body.html": ["SEO Audit", "/services/seo-audit-services"],
  "on-page-seo-body.html": ["On-Page SEO", "/services/on-page-seo-services"],
  "technical-seo-body.html": ["Technical SEO", "/services/technical-seo-services"],
  "ai-seo-body.html": ["AI SEO", "/services/ai-seo-services"],
  "local-seo-body.html": ["Local SEO", "/services/local-seo-services"],
  "google-business-profile-optimization-body.html": [
    "GBP Optimization",
    "/services/google-business-profile-optimization-services",
  ],
  "franchise-seo-body.html": ["Franchise SEO", "/services/franchise-seo-services"],
  "web-and-app-development-body.html": [
    "Web and App Development",
    "/services/web-and-app-development-services",
  ],
  "web-design-and-development-body.html": [
    "Web Design and Development",
    "/services/web-design-and-development-services",
  ],
  "custom-software-development-body.html": [
    "Custom Software Development",
    "/services/custom-software-development-services",
  ],
  "mobile-app-development-body.html": [
    "Mobile App Development",
    "/services/mobile-app-development-services",
  ],
  "artificial-intelligence-services-body.html": [
    "AI Services",
    "/services/artificial-intelligence-services",
  ],
  "ai-development-body.html": ["AI Development", "/services/ai-development-services"],
  "ai-chatbot-development-body.html": [
    "AI Chatbot Development",
    "/services/ai-chatbot-development-services",
  ],
  "ai-agent-development-body.html": [
    "AI Agent Development",
    "/services/ai-agent-development-services",
  ],
  "blog-body.html": ["Blog", "/blog"],
  "accessibility-body.html": ["Accessibility", "/accessibility"],
  "privacy-policy-body.html": ["Privacy Policy", "/privacy-policy"],
  "terms-of-use-body.html": ["Terms of Use", "/terms-of-use"],
  "sitemap-body.html": ["Sitemap", "/sitemap"],
  "book-a-free-evaluation-body.html": [
    "Book a Free Evaluation",
    "/book-a-free-evaluation",
  ],
};

function isHero(attrs) {
  const cls = (attrs.match(/\bclass=["']([^"']*)/) || [])[1] || "";
  const id = (attrs.match(/\bid=["']([^"']*)/) || [])[1] || "";
  if (id === "hero-1" || id === "top") return true;
  return /\b(hs|ct-hero|hero)\b/.test(cls) && !/\bct-body\b/.test(cls);
}

function isSpecial(attrs) {
  const cls = (attrs.match(/\bclass=["']([^"']*)/) || [])[1] || "";
  const id = (attrs.match(/\bid=["']([^"']*)/) || [])[1] || "";
  return id === "fit" || /\bvs\b/.test(cls);
}

const changes = [];

for (const file of Object.keys(map).sort()) {
  const fp = path.join("lib", file);
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, "utf8");
  const [name, route] = map[file];
  const parts = [];
  let prevPaint = null;
  let bad = false;
  const re = /<section\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const id = (attrs.match(/\bid=["']([^"']*)/) || [])[1] || "(no-id)";
    const cls = (attrs.match(/\bclass=["']([^"']*)/) || [])[1] || "";
    const ground = (attrs.match(/\bdata-ground=["']([^"']*)/) || [])[1] || "";
    if (isHero(attrs)) {
      parts.push(`Hero#${id} (own)`);
      prevPaint = "hero";
      continue;
    }
    if (isSpecial(attrs)) {
      parts.push(`${id}/.vs (photo/special — untouched)`);
      prevPaint = "special";
      continue;
    }
    const paint = ground || "?";
    const label =
      paint === "white" ? "white (--surface)" : paint === "tint" ? "tint (--bg-alt)" : paint;
    parts.push(`${id}=${label}`);
    if (prevPaint === paint) bad = true;
    if (/\bcta\b/.test(cls) || id === "contact" || id === "last-call") {
      changes.push({
        page: name,
        route,
        id,
        note: `CTA outer now ${paint} (was skipped / often stuck on tint via #contact{bg-alt})`,
      });
    }
    prevPaint = paint;
  }
  // homepage also has header.hero
  if (file === "homepage-body.html" && !parts[0]?.startsWith("Hero")) {
    parts.unshift("Hero#top (own, <header>)");
  }
  console.log(`${bad ? "BAD" : "OK "} ${name} (${route})`);
  console.log("    " + parts.join(" → "));
}

console.log("\n--- CTA / notable changes ---");
for (const c of changes) {
  console.log(`${c.page}: #${c.id} — ${c.note}`);
}
