export type StatsItem = {
  /** Digits shown in the number span, e.g. "180" */
  num: string;
  /** Brand-blue suffix on the same baseline, e.g. "%", "+", "$M+" */
  sign: string;
  /** Caption under the figure */
  caption: string;
};

/** Default figures from tekcroft-stats-section-final.html */
export const DEFAULT_STATS: StatsItem[] = [
  { num: "180", sign: "%", caption: "Organic traffic growth" },
  { num: "24", sign: "h", caption: "Response time" },
  { num: "20", sign: "+", caption: "Expert Team Members" },
  { num: "98", sign: "%", caption: "Client satisfaction" },
];

/** Exact HTML for body files that inject via Homepage (same markup as <StatsStrip />). */
export function statsStripHtml(items: StatsItem[] = DEFAULT_STATS): string {
  const cells = items
    .map(
      (it) =>
        `<div class="st-c"><b><span>${escapeHtml(it.num)}</span><em>${escapeHtml(it.sign)}</em></b><p>${escapeHtml(it.caption)}</p></div>`
    )
    .join("");
  return `<section class="sec st" id="proof-v2" data-ground="tint" aria-label="Tekcroft results">
  <div class="wrap">
    <div class="st-row rv">
      ${cells}
    </div>
  </div>
</section>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
