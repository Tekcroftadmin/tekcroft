/**
 * Remove full duplicate old-nav CSS copies from page stylesheets.
 * Shared header look lives only in nav-pill (critical) + site-header.html.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function stripSeoAudit() {
  const file = path.join(ROOT, "app", "seo-audit-services.css");
  let src = fs.readFileSync(file, "utf8");
  const start = src.indexOf(".nav{--nav-gap:14px;");
  const endMarker = "/* ---------- shared section furniture ---------- */";
  const end = src.indexOf(endMarker);
  if (start < 0 || end < 0 || end < start) {
    console.log("seo-audit: nav block markers not found / already clean");
    return;
  }
  // Also drop the nav-only responsive block that follows .rv.in
  let out = src.slice(0, start) + src.slice(end);
  out = out.replace(
    /\/\* ---------- responsive: the nav, as the homepage sets it ---------- \*\/\s*@media \(max-width:1080px\)\{\s*\.nav-links\{display:none;\}\s*\.burger\{display:block;\}\s*\.nav\{--nav-gap:10px;\}\s*\.nav-in\{height:64px;\}\s*\.nav-beam rect\{rx:32px; ry:32px;\}\s*\}\s*/m,
    ""
  );
  fs.writeFileSync(file, out);
  console.log("seo-audit: removed duplicate nav block");
}

function stripWebAndApp() {
  const file = path.join(ROOT, "app", "web-and-app-development.css");
  let src = fs.readFileSync(file, "utf8");
  const start = src.indexOf("#web-and-app-development-page .nav{--nav-gap:14px;");
  if (start < 0) {
    console.log("web-and-app: scoped nav block not found / already clean");
    return;
  }
  // Find a safe end: next major section that isn't nav chrome.
  // The scoped nav/theme/burger/mnav block typically ends before page-unique rules.
  const endCandidates = [
    src.indexOf("#web-and-app-development-page .sec{", start),
    src.indexOf("#web-and-app-development-page .hs{", start),
    src.indexOf("#web-and-app-development-page .tag{", start),
    src.indexOf("/* ---------- shared section", start),
    src.indexOf("/* =====", start + 50),
  ].filter((i) => i > start);
  // Prefer cutting before the first @media that only hides nav-links if no section found
  let end = endCandidates.length ? Math.min(...endCandidates) : -1;
  if (end < 0) {
    const m = src.slice(start).search(/\n@media \(max-width:1080px\)\{[^}]*#web-and-app-development-page \.nav-links\{display:none/);
    if (m >= 0) {
      // include that media block
      const after = src.slice(start + m);
      const close = after.indexOf("}\n");
      end = start + m + close + 2;
      // might need second closing for nested - handle simple
    }
  }
  if (end < 0) {
    // Fallback: remove only the conflicting typography/layout lines
    const before = src;
    src = src.replace(
      /#web-and-app-development-page \.nav-links\{position:absolute; left:50%; transform:translateX\(-50%\);\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-links\{display:flex; gap:28px; font-size:14\.5px; font-weight:500; color:var\(--muted\);\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-links a\{position:relative; padding:5px 0; transition:color \.18s var\(--ease\);\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-links a::after\{content:""; position:absolute; left:0; right:100%; bottom:0; height:2px;\s*background:var\(--primary\); transition:right \.25s var\(--ease\);\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-links a:hover\{color:var\(--text\);\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-links a:hover::after\{right:0;\}\s*/g,
      ""
    );
    src = src.replace(
      /#web-and-app-development-page \.nav-in\{position:relative; display:flex; align-items:center; height:74px; gap:16px;\}\s*/g,
      ""
    );
    if (src !== before) {
      fs.writeFileSync(file, src);
      console.log("web-and-app: stripped conflicting nav-link rules");
    } else {
      console.log("web-and-app: no changes");
    }
    return;
  }
  // Also try to include trailing nav media query if it sits right before end
  const chunk = src.slice(start, end);
  if (!chunk.includes("nav-links")) {
    console.log("web-and-app: unexpected chunk, abort");
    return;
  }
  // Keep color-on-hero rules that don't fight pill layout? Safer to drop whole chrome copy.
  const out = src.slice(0, start) + src.slice(end);
  fs.writeFileSync(file, out);
  console.log("web-and-app: removed scoped nav block", chunk.length, "chars");
}

function alignPublicBaseNav() {
  for (const rel of ["public/css/tekcroft.css", "app/tekcroft.css"]) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    let src = fs.readFileSync(file, "utf8");
    const next = src.replace(
      /\.nav-links\{display:flex; gap:22px; font-size:14\.5px; font-weight:500; color:var\(--muted\);\s*text-transform:uppercase; letter-spacing:\.04em;\}/,
      ".nav-links{display:flex; gap:4px; font-size:15px; font-weight:600; color:var(--muted);\n  text-transform:none; letter-spacing:0;}"
    );
    if (next !== src) {
      fs.writeFileSync(file, next);
      console.log("aligned base nav-links", rel);
    }
  }
}

stripSeoAudit();
stripWebAndApp();
alignPublicBaseNav();
console.log("done");
