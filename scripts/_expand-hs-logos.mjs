import fs from "fs";
import path from "path";

const NAMES = [
  "CarePoint",
  "ServiClean",
  "FixMaster",
  "BrightWay",
  "CloudScale",
  "DataDrive",
  "ShopSphere",
  "PeakCart",
  "GrowPilot",
];

function li(name, hidden) {
  const attrs = hidden ? ' aria-hidden="true"' : "";
  return `<li${attrs}><i></i>${name}</li>`;
}

function buildTrack() {
  // 3 visible sets (first set only for SR) + 3 hidden sets = two equal halves
  const halfA = [
    ...NAMES.map((n) => li(n, false)),
    ...NAMES.map((n) => li(n, true)),
    ...NAMES.map((n) => li(n, true)),
  ].join("");
  const halfB = NAMES.map((n) => li(n, true)).join("").repeat(3);
  return halfA + halfB;
}

const track = buildTrack();
const re =
  /<ul class="hs-logos-track">[\s\S]*?<\/ul>/;

for (const f of ["about-us-body.html", "ai-seo-body.html"]) {
  const p = path.join(process.cwd(), "lib", f);
  let html = fs.readFileSync(p, "utf8");
  if (!re.test(html)) {
    console.log("skip (no track)", f);
    continue;
  }
  html = html.replace(re, `<ul class="hs-logos-track">${track}</ul>`);
  fs.writeFileSync(p, html);
  console.log("expanded", f);
}

/* Homepage static marqTrack — replace spans inside #marqTrack */
const home = path.join(process.cwd(), "lib", "homepage-body.html");
let homeHtml = fs.readFileSync(home, "utf8");
const clients = [
  "MedVital",
  "CarePoint",
  "ServiClean",
  "FixMaster",
  "BrightWay",
  "CloudScale",
  "DataDrive",
  "ShopSphere",
  "PeakCart",
  "GrowPilot",
];
const row = clients.map((t) => `<span>${t}</span>`).join("");
const half = row + row + row;
const filled = half + half;
homeHtml = homeHtml.replace(
  /(<div class="marq-track" id="marqTrack">)[\s\S]*?(<\/div>)/,
  `$1${filled}$2`
);
fs.writeFileSync(home, homeHtml);
console.log("expanded homepage-body.html marqTrack");
