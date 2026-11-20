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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Closing/utility headings stay solid ink — no two-tone accent. */
function skipHeadingAccent(plain: string): boolean {
  return /^(conclusion|faqs?)$/i.test((plain || "").replace(/\s+/g, " ").trim());
}

/**
 * Homepage/services two-tone heading: wrap accent phrase in <em>.
 * Prefers focus keyword; otherwise accents the trailing phrase.
 * Skips Conclusion / FAQ(s) so they keep the normal heading color.
 */
export function accentHeadingText(
  plain: string,
  focusKeyword?: string
): string {
  const text = (plain || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (skipHeadingAccent(text)) return escapeHtml(text);

  const kw = (focusKeyword || "").replace(/\s+/g, " ").trim();
  if (kw && text.toLowerCase().includes(kw.toLowerCase())) {
    const re = new RegExp(`(${escapeRegExp(kw)})`, "i");
    return escapeHtml(text).replace(re, "<em>$1</em>");
  }

  const words = text.split(" ");
  if (words.length <= 2) {
    return `<em>${escapeHtml(text)}</em>`;
  }

  // Mirror site section titles: accent the last ~40% (2–5 words).
  const accentCount = Math.min(5, Math.max(2, Math.ceil(words.length * 0.4)));
  const head = words.slice(0, -accentCount).join(" ");
  const tail = words.slice(-accentCount).join(" ");
  return `${escapeHtml(head)} <em>${escapeHtml(tail)}</em>`;
}

/** Wrap the first case-insensitive occurrence of `keyword` in <em>. */
function wrapKeywordOnce(text: string, keyword?: string): string | null {
  const kw = (keyword || "").replace(/\s+/g, " ").trim();
  if (!kw) return null;
  const idx = text.toLowerCase().indexOf(kw.toLowerCase());
  if (idx < 0) return null;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + kw.length);
  const after = text.slice(idx + kw.length);
  return `${escapeHtml(before)}<em>${escapeHtml(match)}</em>${escapeHtml(after)}`;
}

/**
 * Infer primary keyword from common blog title shapes when Rank Math is empty.
 * e.g. "How Do Citations for Local SEO Work? …" → "Citations for Local SEO"
 */
function inferPrimaryKeyword(title: string): string | undefined {
  const t = title.replace(/\s+/g, " ").trim();
  const patterns = [
    /\bhow\s+do(?:es)?\s+(.+?)\s+work\b/i,
    /\bwhat\s+(?:is|are)\s+(.+?)(?:\?|$)/i,
    /\bwhy\s+(.+?)\s+matter\b/i,
    /\b(?:a|the)\s+complete\s+guide\s+to\s+(.+?)(?:\?|$|:|—|–)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const phrase = m?.[1]?.trim();
    if (phrase && phrase.split(/\s+/).length >= 2) return phrase;
  }
  return undefined;
}

/** H1: highlight only the main keyword — never the whole title. */
export function accentTitleHtml(
  title: string,
  focusKeyword?: string
): string {
  const text = (title || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  // 1) Rank Math focus keyword (e.g. "Citations for Local SEO")
  // 2) Inferred phrase from title shape
  // 3) Leave plain if neither matches
  return (
    wrapKeywordOnce(text, focusKeyword) ||
    wrapKeywordOnce(text, inferPrimaryKeyword(text)) ||
    escapeHtml(text)
  );
}

/** Ensure H2s have ids + two-tone <em> accent; return TOC from those headings. */
export function ensureHeadingIds(
  html: string,
  focusKeyword?: string
): {
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

      // Keep editor-authored <em>; skip Conclusion/FAQ; else two-tone accent.
      let accented = inner;
      if (skipHeadingAccent(text)) {
        accented = escapeHtml(text);
      } else if (!/<em[\s>]/i.test(inner)) {
        accented = accentHeadingText(text, focusKeyword);
      }
      return `<h2 id="${id}"${attrStr}>${accented}</h2>`;
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

/** TOC + table chrome + two-tone H2s. FAQs are extracted earlier in mapWpPost. */
export function prepareArticleContent(
  contentHtml: string,
  focusKeyword?: string
): {
  html: string;
  toc: TocItem[];
} {
  const withTables = wrapTables(contentHtml || "");
  const { html, toc } = ensureHeadingIds(withTables, focusKeyword);
  return { html, toc };
}
