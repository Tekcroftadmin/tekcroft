/** Fill footer copyright year so it stays current without a hard-coded value. */
export function stampFooterYear(html: string, year = new Date().getFullYear()): string {
  return html.replace(
    /(<span\s+data-ft-year\b[^>]*>)(?:\d{4})?(<\/span>)/gi,
    `$1${year}$2`
  );
}
