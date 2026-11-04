import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const EXTS = new Set([".html", ".tsx", ".ts", ".js", ".json", ".mjs"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "agent-tools",
  "agent-transcripts",
  "_transcript_franchise_extract",
  "scripts/_mm-design-extract",
]);

const SOCIAL = {
  X: "https://www.x.com/tekcroft",
  Instagram: "https://www.instagram.com/tekcroft",
  Pinterest: "https://www.pinterest.com/tekcroft/",
  LinkedIn: "https://www.linkedin.com/company/tekcroft/",
  YouTube: "https://www.youtube.com/@tekcroft",
  TikTok: "https://www.tiktok.com/@tekcroft",
  Facebook: "https://www.facebook.com/Tekcroft",
};

const SAME_AS = [
  SOCIAL.X,
  SOCIAL.Instagram,
  SOCIAL.Pinterest,
  SOCIAL.LinkedIn,
  SOCIAL.YouTube,
  SOCIAL.TikTok,
  SOCIAL.Facebook,
];

const ADDR_LINE = "30 N Gould St Ste N, Sheridan, Wyoming 82801, United States";
const ADDR_BR = "30 N Gould St Ste N<br>Sheridan, Wyoming 82801, United States";
const ADDR_BR_N = "30 N Gould St Ste N<br />Sheridan, Wyoming 82801, United States";
const MAP_Q = encodeURIComponent(ADDR_LINE);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".") && ent.name !== ".env.example") continue;
    const full = path.join(dir, ent.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, "/");
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name) || SKIP_DIRS.has(rel)) continue;
      walk(full, out);
    } else if (EXTS.has(path.extname(ent.name))) {
      out.push(full);
    }
  }
  return out;
}

function patchSocialAnchors(html) {
  let out = html;
  for (const [label, url] of Object.entries(SOCIAL)) {
    // Match <ahref="https://www.facebook.com/Tekcroft" ...  ... target="_blank" rel="noopener noreferrer"> with any href (incl #)
    const re = new RegExp(
      `<a\\b([^>]*?)\\baria-label="${label}"([^>]*)>`,
      "gi"
    );
    out = out.replace(re, (full, pre, post) => {
      let attrs = `${pre}${post}`;
      if (/\bhref\s*=/.test(attrs)) {
        attrs = attrs.replace(/\bhref\s*=\s*(["']).*?\1/i, `href="${url}"`);
      } else {
        attrs = ` href="${url}"${attrs}`;
      }
      if (!/\btarget\s*=/.test(attrs)) attrs += ` target="_blank"`;
      else attrs = attrs.replace(/\btarget\s*=\s*(["']).*?\1/i, `target="_blank"`);
      if (!/\brel\s*=/.test(attrs)) attrs += ` rel="noopener noreferrer"`;
      else attrs = attrs.replace(/\brel\s*=\s*(["']).*?\1/i, `rel="noopener noreferrer"`);
      return `<a${attrs.startsWith(" ") ? "" : " "}${attrs.trim()}>`.replace(
        /<a\s+/,
        "<a "
      );
    });
  }
  return out;
}

function patchContact(text) {
  let s = text;

  // Email
  s = s.replaceAll("admin@tekcroft.com", "admin@tekcroft.com");
  s = s.replaceAll("mailto:admin@tekcroft.com", "mailto:admin@tekcroft.com");

  // Phone hrefs (do before display text)
  s = s.replaceAll("tel:+18005553100", "tel:+18005553100");
  s = s.replaceAll("tel:+18005553100", "tel:+18005553100");
  s = s.replaceAll("+18005553100", "+18005553100");

  // Phone display (hyphen, en-dash, ndash entity)
  s = s.replaceAll("+1 (800) 555-3100", "+1 (800) 555-3100");
  s = s.replaceAll("+1 (800) 555-3100", "+1 (800) 555-3100");
  s = s.replaceAll("+1 (800) 555-3100", "+1 (800) 555-3100");
  s = s.replaceAll("+1 (800) 555-3100", "+1 (800) 555-3100");

  // Address blocks
  s = s.replaceAll(
    "30 N Gould St Ste N<br>Sheridan, Wyoming 82801, United States",
    ADDR_BR
  );
  s = s.replaceAll(
    "30 N Gould St Ste N<br />Sheridan, Wyoming 82801, United States",
    ADDR_BR_N
  );
  s = s.replaceAll(
    "30 N Gould St Ste N, Sheridan, Wyoming 82801, United States",
    ADDR_LINE
  );
  s = s.replaceAll("30 N Gould St Ste N", "30 N Gould St Ste N");
  s = s.replaceAll("Sheridan, Wyoming 82801, United States", "Sheridan, Wyoming 82801, United States");
  s = s.replaceAll("Sheridan, Wyoming", "Sheridan, Wyoming");

  // Map embed query + title
  s = s.replace(
    /https:\/\/www\.google\.com\/maps\?q=[^"'&\s]+/g,
    (url) => {
      if (/Brickell|Miami|33131/i.test(decodeURIComponent(url))) {
        return `https://www.google.com/maps?q=${MAP_Q}`;
      }
      return url;
    }
  );
  s = s.replace(
    /title="Map showing the office location in Sheridan, Wyoming"/g,
    'title="Map showing the office location in Sheridan, Wyoming"'
  );

  s = patchSocialAnchors(s);
  return s;
}

const files = walk(ROOT);
let changed = 0;
const touched = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  // Skip archived extract scripts noise except live site content
  if (rel.startsWith("scripts/") && !rel.includes("update-contact")) continue;

  const before = fs.readFileSync(file, "utf8");
  let after = before;

  if (rel === "lib/homepage-meta.json") {
    const meta = JSON.parse(before);
    const org = meta.jsonLd?.find(
      (b) => b["@type"] === "ProfessionalService" || b["@type"] === "Organization"
    );
    if (org) {
      org.email = "admin@tekcroft.com";
      org.telephone = "+1-800-555-3100";
      org.address = {
        "@type": "PostalAddress",
        streetAddress: "30 N Gould St Ste N",
        addressLocality: "Sheridan",
        addressRegion: "WY",
        postalCode: "82801",
        addressCountry: "US",
      };
      org.sameAs = SAME_AS;
    }
    after = `${JSON.stringify(meta, null, 2)}\n`;
  } else {
    after = patchContact(before);
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    touched.push(rel);
  }
}

console.log(`updated ${changed} files`);
for (const t of touched) console.log(" -", t);
