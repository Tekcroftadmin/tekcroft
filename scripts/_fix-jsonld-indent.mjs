import fs from "fs";
import path from "path";

const site = path.join(process.cwd(), "app/(site)");

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === "page.tsx") fix(p);
  }
}

function fix(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  // Normalize: Script/component then JsonLd then properly indented </>
  s = s.replace(
    /(\n)([ \t]*)<JsonLd data=\{(\w+)\} \/>\n<\/>/g,
    "$1$2<JsonLd data={$3} />\n$2</>"
  );
  // Also handle JsonLd with extra indent before broken </>
  s = s.replace(
    /(\n)([ \t]*)<JsonLd data=\{(\w+)\} \/>\r?\n<\/>/g,
    "$1$2<JsonLd data={$3} />\n$2</>"
  );
  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log("fixed", path.relative(process.cwd(), file));
  }
}

walk(site);
