import fs from "fs";
import path from "path";

const dir = "public";
const files = fs.readdirSync(dir).filter(
  (f) => /^tekcroft-.*\.js$/.test(f) && !/\.[a-f0-9]{10}\.js$/.test(f)
);

for (const f of files) {
  const p = path.join(dir, f);
  let src = fs.readFileSync(p, "utf8");
  if (src.includes("--nav-h-live")) {
    console.log("skip (already)", f);
    continue;
  }
  // document.documentElement.style.setProperty("--nav-h", EXPR)
  // or n.style.setProperty("--nav-h", EXPR) where n is documentElement
  const next = src.replace(
    /([.\w]+)\.style\.setProperty\("--nav-h",\s*([^)]+)\)/g,
    (full, obj, expr) => {
      if (full.includes("nav-h-live")) return full;
      return `${obj}.style.setProperty("--nav-h", ${expr});${obj}.style.setProperty("--nav-h-live", ${expr})`;
    }
  );
  if (next === src) {
    console.log("no-match", f);
    continue;
  }
  fs.writeFileSync(p, next);
  console.log("patched", f);
}
