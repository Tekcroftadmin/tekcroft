import fs from "fs";
import path from "path";

const lib = path.join(process.cwd(), "lib");
const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html")).sort();

for (const f of files) {
  const html = fs.readFileSync(path.join(lib, f), "utf8");
  const secs = [];
  const re = /<section\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const id = (attrs.match(/\bid=["']([^"']+)/) || [])[1] || "";
    const cls = (attrs.match(/\bclass=["']([^"']+)/) || [])[1] || "";
    const ground = (attrs.match(/\bdata-ground=["']([^"']+)/) || [])[1] || "(none)";
    const isHero = /\bhs\b/.test(cls) || id === "hero-1" || /\bct-hero\b/.test(cls);
    secs.push({ id, cls: cls.slice(0, 70), ground, isHero });
  }
  console.log(`\n=== ${f} (${secs.length} sections) ===`);
  secs.forEach((s, i) => {
    console.log(
      String(i + 1).padStart(2),
      s.isHero ? "HERO" : "    ",
      `ground=${s.ground.padEnd(8)}`,
      `#${s.id || "-"}`,
      s.cls
    );
  });
}
