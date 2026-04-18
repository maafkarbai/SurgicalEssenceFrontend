/**
 * Convert a title string to a URL-safe slug.
 * e.g. "Surgical Essence Launches New Line!" → "surgical-essence-launches-new-line"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars (keep hyphens)
    .replace(/[\s_]+/g, "-")     // spaces/underscores → hyphen
    .replace(/-+/g, "-")         // collapse repeated hyphens
    .replace(/^-+|-+$/g, "");    // strip leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a short timestamp suffix when needed.
 * Pass a `checkExists(slug) → Promise<boolean>` to detect collisions.
 */
export async function uniqueSlug(title, checkExists) {
  const base = slugify(title) || "press-release";
  if (!(await checkExists(base))) return base;

  // Append a 4-char hex timestamp fragment to disambiguate
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}
