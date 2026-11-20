/** Blog-post-page helpers only — does not change shared WordPress mapping. */

export type TocItem = { id: string; text: string };

export type FaqItem = { question: string; answerHtml: string };

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(text: string, used: Set<string>): string {
  let base = text
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  if (!base) base = "section";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n++}`;
  }
  used.add(id);
  return id;
}

/** Pull FAQ blocks out of WordPress HTML; return remaining body + items. */
export function extractFaqs(html: string): {
  html: string;
  faqs: FaqItem[];
  heading: string;
} {
  const faqs: FaqItem[] = [];
  let out = html;
  let heading = "FAQs";

  // Only the dedicated FAQ heading (never match across earlier H2s).
  const headingMatch = /<h2[^>]*>\s*(FAQs?)\s*<\/h2>/i.exec(out);
  if (headingMatch) {
    heading = stripTags(headingMatch[1]) || "FAQs";
  }

  // Rank Math FAQ block (list-item OR legacy faq-item)
  out = out.replace(
    /<div[^>]*class="[^"]*rank-math-(?:list-item|faq-item)[^"]*"[^>]*>[\s\S]*?<h[23][^>]*class="[^"]*rank-math-question[^"]*"[^>]*>([\s\S]*?)<\/h[23]>[\s\S]*?<div[^>]*class="[^"]*rank-math-answer[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi,
    (_m, q, a) => {
      faqs.push({ question: stripTags(q), answerHtml: String(a).trim() });
      return "";
    }
  );

  // Remove empty Rank Math FAQ wrappers left after item extraction
  if (faqs.length) {
    out = out.replace(
      /<div[^>]*(?:id="rank-math-faq"|class="[^"]*rank-math-(?:block|list|faq)[^"]*")[^>]*>\s*<\/div>/gi,
      ""
    );
    out = out.replace(
      /<div[^>]*(?:id="rank-math-faq"|class="[^"]*rank-math-(?:block|list|faq)[^"]*")[^>]*>\s*<div[^>]*class="[^"]*rank-math-list[^"]*"[^>]*>\s*<\/div>\s*<\/div>/gi,
      ""
    );
  }

  // Native <details>/<summary>
  out = out.replace(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi,
    (_m, q, a) => {
      const ans = String(a)
        .replace(/^<div[^>]*class="[^"]*ans[^"]*"[^>]*>/i, "")
        .replace(/<\/div>\s*$/i, "")
        .trim();
      faqs.push({
        question: stripTags(q),
        answerHtml: ans || String(a).trim(),
      });
      return "";
    }
  );

  // Yoast schema-faq
  out = out.replace(
    /<div[^>]*class="[^"]*schema-faq-section[^"]*"[^>]*>[\s\S]*?(?:<strong[^>]*class="[^"]*schema-faq-question[^"]*"[^>]*>|<h[23][^>]*>)([\s\S]*?)(?:<\/strong>|<\/h[23]>)[\s\S]*?<p[^>]*class="[^"]*schema-faq-answer[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>/gi,
    (_m, q, a) => {
      faqs.push({ question: stripTags(q), answerHtml: `<p>${a}</p>` });
      return "";
    }
  );

  // H2 FAQs / FAQ section with H3 questions (fallback when no Rank Math / details block)
  const faqHeading = /<h2[^>]*>\s*FAQs?\s*<\/h2>/i.exec(out);
  if (faqHeading && faqs.length === 0) {
    const start = faqHeading.index!;
    const after = out.slice(start + faqHeading[0].length);
    const nextH2 = after.search(/<h2[\s>]/i);
    const block = nextH2 >= 0 ? after.slice(0, nextH2) : after;
    const qRe =
      /<h3[^>]*>([\s\S]*?)<\/h3>\s*((?:<(?!h[23]\b)[^>]+>[\s\S]*?)+)/gi;
    let qm;
    while ((qm = qRe.exec(block))) {
      faqs.push({
        question: stripTags(qm[1]),
        answerHtml: qm[2].trim(),
      });
    }
    if (faqs.length) {
      const end = start + faqHeading[0].length + block.length;
      out = out.slice(0, start) + out.slice(end);
    }
  }

  // Drop ONLY the FAQ heading after accordion items were extracted
  if (faqs.length) {
    out = out.replace(/<h2[^>]*>\s*FAQs?\s*<\/h2>\s*/gi, "");
  }

  // Clean leftover empty wrappers / whitespace-only divs near FAQ residue
  out = out.replace(/(?:<div[^>]*>\s*<\/div>\s*)+$/gi, "");

  return { html: out, faqs, heading };
}

/** Ensure H2s have ids; return TOC from those headings. */
export function ensureHeadingIds(html: string): {
  html: string;
  toc: TocItem[];
} {
  const used = new Set<string>();
  const toc: TocItem[] = [];
  const next = html.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_m, attrs = "", inner) => {
      const text = stripTags(inner);
      if (!text) return `<h2${attrs || ""}>${inner}</h2>`;
      const idMatch = /\sid=["']([^"']+)["']/i.exec(attrs || "");
      const id = idMatch ? idMatch[1] : slugify(text, used);
      if (idMatch) used.add(id);
      const cleaned = (attrs || "")
        .replace(/\sid=["'][^"']*["']/i, "")
        .trim();
      const attrStr = cleaned ? ` ${cleaned}` : "";
      toc.push({ id, text });
      return `<h2 id="${id}"${attrStr}>${inner}</h2>`;
    }
  );
  return { html: next, toc };
}

/** Normalize WP/Gutenberg tables into full-width `.tablewrap` chrome. */
export function wrapTables(html: string): string {
  let out = html || "";

  // Flatten figure.wp-block-table → tablewrap (avoid nested shrink-wrap).
  out = out.replace(
    /<figure\b[^>]*\bwp-block-table\b[^>]*>([\s\S]*?)<\/figure>/gi,
    (_m, inner: string) => {
      const tableMatch = inner.match(/<table\b[\s\S]*?<\/table>/i);
      if (!tableMatch) return _m;
      return `<div class="tablewrap">${tableMatch[0]}</div>`;
    }
  );

  out = out.replace(
    /(?:<div[^>]*class="[^"]*tablewrap[^"]*"[^>]*>[\s\S]*?<\/div>)|(<table[\s\S]*?<\/table>)/gi,
    (m, table) => {
      if (!table) return m;
      if (/class=["'][^"']*tablewrap/i.test(m)) return m;
      return `<div class="tablewrap">${table}</div>`;
    }
  );

  // Drop fixed HTML width attrs so CSS can stretch to paragraph width.
  out = out.replace(
    /(<table\b[^>]*?)\swidth\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    "$1"
  );

  return out;
}

/** TOC + table chrome for article body. FAQs are extracted earlier in mapWpPost. */
export function prepareArticleContent(contentHtml: string): {
  html: string;
  toc: TocItem[];
} {
  const withTables = wrapTables(contentHtml || "");
  const { html, toc } = ensureHeadingIds(withTables);
  return { html, toc };
}
