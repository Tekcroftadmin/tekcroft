import fs from "fs";
import path from "path";

const dir = "lib";
const files = fs.readdirSync(dir).filter((f) => f.endsWith("-body.html"));
for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /<section[^>]*class="[^"]*\bpf\b[^"]*"[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index;
    const end = html.indexOf("</section>", start);
    const chunk = html.slice(start, end);
    const id = (m[0].match(/id="([^"]+)"/) || [])[1] || "";
    const h2 = (chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "";
    const title = h2.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hasOrbit = /pf-orbit/.test(chunk);
    const hasCarousel = /pf-carousel/.test(chunk);
    const hasCta = /pf-cta/.test(chunk);
    const hasCardLinks = /<a[^>]*class="[^"]*pf-card|pf-card[^>]*>[\s\S]*?<a /.test(chunk);
    console.log(
      JSON.stringify({
        file: f,
        id,
        title,
        hasOrbit,
        hasCarousel,
        hasCta,
        hasCardLinks,
      })
    );
  }
}
