export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function summaryToSlug(summary: string): string {
  return summary
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

export function slugToTag(slug: string, categories: { name: string; slug: string }[]): string | undefined {
  return categories.find((c) => c.slug === slug)?.name;
}
