import fs from "fs";

const xml = fs.readFileSync("scripts/_schema-docx/word/document.xml", "utf8");

/** Decode common XML entities */
function dec(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Convert document body to readable text while preserving table cell
 * boundaries as |CELL| and row ends as |ROW|.
 */
function bodyToBlocks(docXml) {
  // Strip soft hyphens / proofErr noise by working on paragraphs and cells.
  const parts = [];
  // Walk tbl / tr / tc / p roughly via regex splits
  let i = 0;
  const bodyMatch = docXml.match(/<w:body[\s\S]*<\/w:body>/);
  const body = bodyMatch ? bodyMatch[0] : docXml;

  // Replace tables with marked content
  let out = body.replace(/<w:tbl[\s\S]*?<\/w:tbl>/g, (tbl) => {
    const rows = [];
    const trs = tbl.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    for (const tr of trs) {
      const cells = [];
      const tcs = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
      for (const tc of tcs) {
        const texts = [...tc.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(
          (m) => dec(m[1])
        );
        cells.push(texts.join(""));
      }
      rows.push(cells.join("\n---CELL---\n"));
    }
    return (
      "\n\n===== TABLE START =====\n" +
      rows.join("\n===== ROW =====\n") +
      "\n===== TABLE END =====\n\n"
    );
  });

  // Remaining paragraphs
  out = out.replace(/<w:tab\/>/g, "\t");
  out = out.replace(/<w:br[^/]*\/>/g, "\n");
  out = out.replace(/<\/w:p>/g, "\n");
  out = out.replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, (_, t) => dec(t));
  out = out.replace(/<[^>]+>/g, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

const text = bodyToBlocks(xml);
fs.writeFileSync("scripts/_schema-doc.txt", text, "utf8");
console.log("wrote scripts/_schema-doc.txt", text.length, "chars");

// Also extract every JSON-looking object from tables
const jsonBlocks = [];
const tableChunks = [
  ...text.matchAll(/===== TABLE START =====([\s\S]*?)===== TABLE END =====/g),
];
for (const [i, m] of tableChunks.entries()) {
  const chunk = m[1];
  // Find JSON objects: from first { that starts a script or raw JSON
  const cleaned = chunk
    .replace(/<script[^>]*>/gi, "")
    .replace(/<\/script>/gi, "");
  let start = cleaned.indexOf("{");
  while (start >= 0) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let j = start; j < cleaned.length; j++) {
      const c = cleaned[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (end > start) {
      const json = cleaned.slice(start, end + 1);
      jsonBlocks.push(json);
      start = cleaned.indexOf("{", end + 1);
    } else break;
  }
}

fs.writeFileSync(
  "scripts/_schema-jsons.json",
  JSON.stringify(jsonBlocks, null, 2),
  "utf8"
);
console.log("extracted", jsonBlocks.length, "JSON blocks");
jsonBlocks.forEach((j, i) => {
  try {
    const o = JSON.parse(j);
    const types = Array.isArray(o["@graph"])
      ? o["@graph"].map((x) => x["@type"]).join(",")
      : o["@type"];
    const id = o["@id"] || (o["@graph"] && o["@graph"][0] && o["@graph"][0]["@id"]);
    console.log(i, types, id || "");
  } catch (e) {
    console.log(i, "PARSE FAIL", e.message, j.slice(0, 80));
  }
});
