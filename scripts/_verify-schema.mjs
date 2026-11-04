const pages = [
  "/",
  "/about-us",
  "/contact-us",
  "/seo-services",
  "/ecommerce-seo-services",
  "/seo-audit-services",
  "/on-page-seo-services",
  "/technical-seo-services",
  "/ai-seo-services",
  "/local-seo-services",
  "/google-business-profile-optimization-services",
  "/franchise-seo-services",
  "/ai-development-services",
  "/ai-chatbot-development-services",
  "/ai-agent-development-services",
  "/web-design-and-development-services",
  "/custom-software-development-services",
  "/mobile-app-development-services",
];

const base = process.env.BASE || "http://127.0.0.1:3456";

function extractLd(html) {
  const re =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    out.push(JSON.parse(m[1].replace(/\\u003c/g, "<")));
  }
  return out;
}

function collectTypes(node, acc = []) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, acc);
    return acc;
  }
  if (node["@type"]) acc.push(node["@type"]);
  if (node["@graph"]) collectTypes(node["@graph"], acc);
  return acc;
}

let failed = 0;
for (const p of pages) {
  const res = await fetch(base + p);
  const html = await res.text();
  const blocks = extractLd(html);
  const types = blocks.flatMap((b) => collectTypes(b));
  const orgCount = types.filter((t) => t === "Organization").length;
  const ok =
    res.status === 200 &&
    blocks.length >= 2 &&
    orgCount === 1 &&
    types.includes("WebSite") === (true); // sitewide always present
  if (!ok || orgCount !== 1) {
    failed++;
    console.log("FAIL", p, { status: res.status, blocks: blocks.length, orgCount, types });
  } else {
    console.log("OK  ", p, types.join(", "));
  }
}

// logo
const logo = await fetch(base + "/logo.png");
console.log("logo.png", logo.status, logo.headers.get("content-type"));

process.exit(failed ? 1 : 0);
