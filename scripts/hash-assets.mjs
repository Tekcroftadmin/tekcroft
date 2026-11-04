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
  "tekcroft-mm.js",
  "tekcroft-vs-halo.js",
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
];

const keys = [
  "main",
  "homeDefer",
  "mm",
  "vsHalo",
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
const localSeoCss = path.join(ROOT, "app", "local-seo.css");
if (fs.existsSync(localSeoCss)) {
  fs.copyFileSync(localSeoCss, path.join(cssOut, "local-seo.css"));
  console.log("synced public/css/local-seo.css");
}
const tekcroftCss = path.join(ROOT, "app", "tekcroft.css");
if (fs.existsSync(tekcroftCss)) {
  const lines = fs.readFileSync(tekcroftCss, "utf8").split(/\n/);
  /* Lines 0–719 = above-the-fold (tokens/nav/hero); remainder deferred */
  const CRITICAL_END = 720;
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
    "  #top.hero .hero-in, header.hero .hero-in{margin-block:auto!important;}\n" +
    "}\n";
  fs.writeFileSync(path.join(ROOT, "app", "tekcroft-critical.css"), critical);
  fs.writeFileSync(
    path.join(cssOut, "tekcroft-defer.css"),
    lines.slice(CRITICAL_END).join("\n")
  );
  console.log(
    "synced tekcroft-critical.css + public/css/tekcroft-defer.css (split @" +
      CRITICAL_END +
      ", critical " +
      (critical.length / 1024).toFixed(1) +
      "KB)"
  );
}
