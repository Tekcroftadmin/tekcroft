/**
 * Minify first-party runtime scripts, then copy to content-hashed filenames
 * for long-cache. Writes lib/asset-manifest.json consumed by page loaders.
 *
 * Source files in /public stay readable; only hashed outputs are minified.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(ROOT, "public");
const require = createRequire(import.meta.url);

let minifyJs = null;
try {
  // Reuse Next's bundled terser — no extra dependency
  const terser = require("next/dist/compiled/terser");
  minifyJs = async (code, name) => {
    const result = await terser.minify(code, {
      compress: {
        passes: 1,
        drop_console: false,
        pure_getters: true,
      },
      mangle: true,
      format: { comments: false },
      sourceMap: false,
    });
    if (result.error) throw result.error;
    if (!result.code) throw new Error("empty minify output for " + name);
    return result.code;
  };
} catch (err) {
  console.warn("terser unavailable — hashing without minify:", err.message);
  minifyJs = async (code) => code;
}

async function hashFile(name) {
  const srcPath = path.join(pub, name);
  const src = fs.readFileSync(srcPath, "utf8");
  const min = await minifyJs(src, name);
  const buf = Buffer.from(min, "utf8");
  const h = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
  const hashed = name.replace(/\.js$/, `.${h}.js`);
  fs.writeFileSync(path.join(pub, hashed), buf);
  const base = name.replace(/\.js$/, "");
  for (const f of fs.readdirSync(pub)) {
    if (
      f.startsWith(base + ".") &&
      f.endsWith(".js") &&
      f !== hashed &&
      f !== name
    ) {
      fs.unlinkSync(path.join(pub, f));
    }
  }
  const saved = ((src.length - buf.length) / 1024).toFixed(1);
  console.log(
    name,
    "→",
    hashed,
    `(${(src.length / 1024).toFixed(1)} → ${(buf.length / 1024).toFixed(1)} KB, −${saved} KB)`
  );
  return "/" + hashed;
}

const names = [
  "tekcroft-main.js",
  "tekcroft-home-defer.js",
  "tekcroft-home-invite.js",
  "tekcroft-eg-scroll.js",
  "tekcroft-rv.js",
  "tekcroft-mm.js",
  "tekcroft-vs-halo.js",
  "tekcroft-pf-marquee.js",
  "tekcroft-ecommerce-seo.js",
  "tekcroft-seo-services.js",
  "tekcroft-seo-audit-services.js",
  "tekcroft-technical-seo.js",
  "tekcroft-local-seo.js",
  "tekcroft-on-page-seo.js",
  "tekcroft-google-business-profile-optimization.js",
  "tekcroft-mobile-app-development.js",
  "tekcroft-custom-software-development.js",
  "tekcroft-web-design-and-development.js",
  "tekcroft-web-and-app-development.js",
  "tekcroft-ai-chatbot-development.js",
  "tekcroft-ai-agent-development.js",
  "tekcroft-ai-development.js",
  "tekcroft-artificial-intelligence-services.js",
  "tekcroft-franchise-seo.js",
  "tekcroft-ai-seo.js",
  "tekcroft-contact.js",
  "tekcroft-about-us.js",
  "tekcroft-services.js",
  "tekcroft-book-a-free-evaluation.js",
  "tekcroft-lead-submit.js",
  "tekcroft-404.js",
];

const keys = [
  "main",
  "homeDefer",
  "homeInvite",
  "egScroll",
  "rv",
  "mm",
  "vsHalo",
  "pfMarquee",
  "ecommerceSeo",
  "seoServices",
  "seoAuditServices",
  "technicalSeo",
  "localSeo",
  "onPageSeo",
  "googleBusinessProfileOptimization",
  "mobileAppDevelopment",
  "customSoftwareDevelopment",
  "webDesignAndDevelopment",
  "webAndAppDevelopment",
  "aiChatbotDevelopment",
  "aiAgentDevelopment",
  "aiDevelopment",
  "artificialIntelligenceServices",
  "franchiseSeo",
  "aiSeo",
  "contact",
  "aboutUs",
  "services",
  "bookAFreeEvaluation",
  "leadSubmit",
  "notFound",
];

const manifest = {};
for (let i = 0; i < names.length; i++) {
  manifest[keys[i]] = await hashFile(names[i]);
}

fs.writeFileSync(
  path.join(ROOT, "lib", "asset-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);
console.log("manifest written");

/* Keep deferred CSS copies in /public/css (Local SEO slim layout + similar) */
const cssOut = path.join(pub, "css");
fs.mkdirSync(cssOut, { recursive: true });

/** Conservative CSS minify — comments + excess whitespace only (no new deps). */
function minifyCss(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function syncDeferredPageCss(name) {
  const srcPath = path.join(ROOT, "app", name);
  if (!fs.existsSync(srcPath)) return;
  const raw = fs.readFileSync(srcPath, "utf8");
  const out = minifyCss(raw);
  fs.writeFileSync(path.join(cssOut, name), out);
  console.log(
    "synced public/css/" +
      name +
      " (" +
      (raw.length / 1024).toFixed(1) +
      " → " +
      (out.length / 1024).toFixed(1) +
      " KB)"
  );
}

syncDeferredPageCss("local-seo.css");
syncDeferredPageCss("seo-audit-services.css");

/* Below-fold + former render-blocking locks — one deferred sheet so
   Lighthouse is not blocked by 5+ Next CSS chunks on homepage. */
{
  const lockNames = [
    "footer-lock.css",
    "site-consistency.css",
    "vs-halo-lock.css",
    "pf-mode-lock.css",
    "pf-center-and-cards-lock.css",
    "hero-marquee-lock.css",
    "a11y-lock.css",
    "internal-link.css",
    /* Was imported as blocking Next chunks in (site)/layout — defer instead */
    "responsive.css",
    "mobile-menu.css",
    "service-hero-lock.css",
    "mobile-cta-btn-lock.css",
  ];
  /* Also emit standalone deferred sheets referenced by pages */
  syncDeferredPageCss("home-invite.css");
  const parts = [];
  for (const name of lockNames) {
    const p = path.join(ROOT, "app", name);
    if (!fs.existsSync(p)) continue;
    parts.push("/* === " + name + " === */\n" + fs.readFileSync(p, "utf8"));
  }
  if (parts.length) {
    const raw = parts.join("\n");
    const out = minifyCss(raw);
    fs.writeFileSync(path.join(cssOut, "site-locks-defer.css"), out);
    console.log(
      "synced public/css/site-locks-defer.css (" +
        (raw.length / 1024).toFixed(1) +
        " → " +
        (out.length / 1024).toFixed(1) +
        " KB)"
    );
  }
}
const tekcroftCss = path.join(ROOT, "app", "tekcroft.css");
if (fs.existsSync(tekcroftCss)) {
  const lines = fs.readFileSync(tekcroftCss, "utf8").split(/\n/);
  /* Above-the-fold through the dark #proof rule. Cut on THAT rule's
     closing brace — a mid-rule cut nests stats-strip.css inside it
     (CSS nesting) and the strip falls back to the timeline .st-row. */
  const src = lines.join("\n");
  const marker = 'html[data-theme="dark"] section#proof{';
  const at = src.indexOf(marker);
  let CRITICAL_END = 727;
  if (at >= 0) {
    let i = at + marker.length;
    let d = 1;
    while (i < src.length && d > 0) {
      if (src[i] === "{") d++;
      else if (src[i] === "}") d--;
      i++;
    }
    CRITICAL_END = src.slice(0, i).split("\n").length;
  }
  let critical = lines.slice(0, CRITICAL_END).join("\n") + "\n";
  for (const extra of ["stats-strip.css", "nav-pill.css", "perf.css"]) {
    const p = path.join(ROOT, "app", extra);
    if (fs.existsSync(p)) {
      critical +=
        "\n/* === " + extra + " === */\n" + fs.readFileSync(p, "utf8") + "\n";
    }
  }
  /* Pin home hero box so deferred mobile overrides cannot CLS .hero-in */
  critical +=
    "\n@media (max-width:900px){\n" +
    "  #top.hero, header.hero{\n" +
    "    min-height:100vh!important;min-height:100svh!important;\n" +
    "    padding-top:calc(var(--nav-h) + 62px)!important;\n" +
    "    padding-bottom:20px!important;\n" +
    "  }\n" +
    "  #top.hero .hero-in, header.hero .hero-in{margin-block:auto!important;text-align:center!important;align-items:center!important;}\n" +
    "  #top.hero .lamp, header.hero .lamp{width:100%!important;max-width:100%!important;margin-inline:auto!important;text-align:center!important;}\n" +
    "  #top.hero .lamp h1, header.hero .lamp h1{width:100%!important;text-align:center!important;margin-inline:0!important;}\n" +
    "  #top.hero .lamp .ln, #top.hero .lamp .ln > span, header.hero .lamp .ln, header.hero .lamp .ln > span{display:block!important;width:100%!important;text-align:center!important;}\n" +
    "  #top.hero .kw, header.hero .kw{display:grid!important;width:100%!important;max-width:100%!important;margin-inline:0!important;padding-inline:0!important;justify-items:center!important;box-sizing:border-box!important;}\n" +
    "}\n" +
    /* Phone only: longest rotating keyword must fit one line (nowrap + overflow:hidden clips both ends when centered). */
    "@media (max-width:767px){\n" +
    "  #top.hero .kw, header.hero .kw{\n" +
    "    font-size:clamp(18px, calc((100vw - 2 * var(--wrap-x, 16px) - 4px) / 13.7), 1em)!important;\n" +
    "  }\n" +
    "  #top.hero .kw i, header.hero .kw i{white-space:nowrap!important;}\n" +
    "}\n";
  fs.writeFileSync(path.join(ROOT, "app", "tekcroft-critical.css"), critical);
  const deferRaw = lines.slice(CRITICAL_END).join("\n");
  const deferMin = minifyCss(deferRaw);
  fs.writeFileSync(path.join(cssOut, "tekcroft-defer.css"), deferMin);
  console.log(
    "synced tekcroft-critical.css + public/css/tekcroft-defer.css (split @" +
      CRITICAL_END +
      ", critical " +
      (critical.length / 1024).toFixed(1) +
      "KB, defer " +
      (deferRaw.length / 1024).toFixed(1) +
      " → " +
      (deferMin.length / 1024).toFixed(1) +
      " KB)"
  );
}
