import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const SLUGS = [
  "google-business-profile-optimization-services",
  "web-design-and-development-services",
  "custom-software-development-services",
  "web-and-app-development-services",
  "artificial-intelligence-services",
  "ai-chatbot-development-services",
  "ai-agent-development-services",
  "mobile-app-development-services",
  "ai-development-services",
  "franchise-seo-services",
  "ecommerce-seo-services",
  "technical-seo-services",
  "seo-audit-services",
  "on-page-seo-services",
  "local-seo-services",
  "ai-seo-services",
  "seo-services",
].sort((a, b) => b.length - a.length);

function rewriteText(text) {
  let out = text;
  for (const slug of SLUGS) {
    const reHref = new RegExp(`(href=["'])/${slug}(?=["'#?])`, "g");
    out = out.replace(reHref, `$1/services/${slug}`);

    const reAbs = new RegExp(
      `https://www\\.tekcroft\\.com/${slug}(?=[ "'#?]|$)`,
      "g"
    );
    out = out.replace(reAbs, `https://www.tekcroft.com/services/${slug}`);

    // JS / JSON string paths: "/slug" or '/slug' (not already /services/)
    const reDq = new RegExp(`(?<!/services)"/${slug}(?=["'#?])`, "g");
    out = out.replace(reDq, `"/services/${slug}`);
    const reSq = new RegExp(`(?<!/services)'/${slug}(?=[''#?])`, "g");
    out = out.replace(reSq, `'/services/${slug}`);
  }
  return out;
}

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === ".next" ||
      name === ".git" ||
      name === "scripts" && dir === ROOT
    )
      continue;
    // still process scripts selectively below
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkFiles(p, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

/* 1) Move page folders under app/(site)/services/<slug> */
const siteDir = path.join(ROOT, "app", "(site)");
const servicesDir = path.join(siteDir, "services");
fs.mkdirSync(servicesDir, { recursive: true });

const moves = [];
for (const slug of SLUGS) {
  const fromSite = path.join(siteDir, slug);
  const fromLocal = path.join(ROOT, "app", "(local)", slug);
  const dest = path.join(servicesDir, slug);
  if (fs.existsSync(dest)) {
    console.log("already at dest", slug);
    continue;
  }
  if (fs.existsSync(fromSite)) {
    fs.renameSync(fromSite, dest);
    moves.push(`${slug} (site)`);
  } else if (fs.existsSync(fromLocal)) {
    fs.renameSync(fromLocal, dest);
    moves.push(`${slug} (local)`);
  } else {
    console.warn("MISSING page folder", slug);
  }
}
console.log("moved", moves.length, moves);

/* 2) Rewrite links / canonicals / schema in content + source files */
const targets = [
  ...walkFiles(path.join(ROOT, "lib"), [".html", ".json", ".ts", ".tsx", ".js"]),
  ...walkFiles(path.join(ROOT, "public"), [".js"]),
  ...walkFiles(path.join(ROOT, "components"), [".tsx", ".ts", ".js"]),
  ...walkFiles(path.join(ROOT, "app"), [".tsx", ".ts", ".js", ".css", ".json"]),
];

let rewritten = 0;
for (const file of targets) {
  // Skip hashed bundles; source js is enough (hash-assets refreshes)
  if (/tekcroft-[a-z0-9-]+\.[a-f0-9]+\.js$/i.test(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = rewriteText(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    rewritten++;
    console.log("rewrote", path.relative(ROOT, file));
  }
}
console.log("files rewritten", rewritten);

/* 3) Sitemap */
const sitemapPath = path.join(ROOT, "app", "sitemap.ts");
let sm = fs.readFileSync(sitemapPath, "utf8");
for (const slug of SLUGS) {
  sm = sm.replaceAll(`"/${slug}"`, `"/services/${slug}"`);
}
fs.writeFileSync(sitemapPath, sm);
console.log("sitemap updated");

/* 4) next.config redirects */
const cfgPath = path.join(ROOT, "next.config.js");
const redirects = SLUGS.map(
  (slug) => `      {
        source: "/${slug}",
        destination: "/services/${slug}",
        permanent: true,
      }`
).join(",\n");

const shortAliases = [
  ["ecommerce-seo", "ecommerce-seo-services"],
  ["on-page-seo", "on-page-seo-services"],
  ["technical-seo", "technical-seo-services"],
  ["local-seo", "local-seo-services"],
  ["google-business-profile-optimization", "google-business-profile-optimization-services"],
  ["franchise-seo", "franchise-seo-services"],
  ["web-and-app-development", "web-and-app-development-services"],
  ["web-design-and-development", "web-design-and-development-services"],
  ["software-development-services", "custom-software-development-services"],
  ["mobile-app-development", "mobile-app-development-services"],
]
  .map(
    ([from, to]) => `      {
        source: "/services/${from}",
        destination: "/services/${to}",
        permanent: true,
      }`
  )
  .join(",\n");

const newRedirectsBlock = `  async redirects() {
    return [
      /* Old root service URLs → /services/<slug> */
${redirects},
      /* Short legacy aliases → prefixed service slugs */
${shortAliases},
      /* TEMP: /case-studies not built yet */
      {
        source: "/case-studies",
        destination: "/",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "/contact-us",
        permanent: true,
      },
    ];
  },`;

let cfg = fs.readFileSync(cfgPath, "utf8");
cfg = cfg.replace(/async redirects\(\)\s*\{[\s\S]*?\n  \},/, newRedirectsBlock);
fs.writeFileSync(cfgPath, cfg);
console.log("next.config redirects updated");

console.log("DONE");
