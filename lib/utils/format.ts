/**
 * All money in this codebase is stored as an integer number of pence to
 * avoid floating point rounding errors when summing basket/order totals.
 * Formatting to a display string happens only here, at render time.
 */
export function formatPrice(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * JSON.stringify does not escape `<`, so a value containing a literal
 * `</script>` could break out of a <script type="application/ld+json">
 * tag. Escaping `<` as a unicode sequence keeps the JSON semantically
 * identical while making that breakout impossible.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
