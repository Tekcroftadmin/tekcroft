/**
 * One-time: write lib/site-header.html from about-us nav, then strip
 * embedded nav + footer from every *-body.html (except booking).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");

const about = fs.readFileSync(path.join(LIB, "about-us-body.html"), "utf8");
const navMatch = about.match(/<nav class="nav"[\s\S]*?<\/nav>/i);
if (!navMatch) throw new Error("no nav in about-us-body.html");
fs.writeFileSync(path.join(LIB, "site-header.html"), navMatch[0].trimEnd() + "\n");
console.log("wrote site-header.html", navMatch[0].length, "chars");

const FOOTER_RE =
  /(?:<!--[^\n]*FOOTER[^\n]*-->\s*)?(?:<div class="ftm"[\s\S]*?<\/footer>|<footer class="ft4"[\s\S]*?<\/footer>)/i;
const NAV_BLOCK_RE =
  /(?:<!--[^\n]*NAV[^\n]*-->\s*)?<nav class="nav"[\s\S]*?<\/nav>\s*/i;

const skip = new Set(["book-a-free-evaluation-body.html"]);
const bodies = fs
  .readdirSync(LIB)
  .filter((n) => n.endsWith("-body.html") && !skip.has(n));

let stripped = 0;
for (const name of bodies) {
  let html = fs.readFileSync(path.join(LIB, name), "utf8");
  if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);
  const before = html;
  html = html.replace(NAV_BLOCK_RE, "");
  html = html.replace(FOOTER_RE, "");
  html = html.replace(/\s+$/, "\n");
  if (html !== before) {
    fs.writeFileSync(path.join(LIB, name), html);
    stripped++;
    const stillNav = /<nav class="nav"/i.test(html);
    const stillFt = /class="ft4"|<div class="ftm"/i.test(html);
    console.log(name, "nav?", stillNav, "footer?", stillFt);
  } else {
    console.log(name, "NO CHANGE");
  }
}
console.log(`stripped ${stripped} of ${bodies.length}`);
