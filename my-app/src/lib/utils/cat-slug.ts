// src/lib/utils/cat-slug.ts
import type { Category } from '$lib/types';

/**
 * We don't expose a "Politics" route (News is the homepage),
 * so this map is partial on purpose.
 */
export const CAT_TO_SLUG: Partial<Record<Category, string>> = {
	Business: 'business',
	Sports: 'sports',
	Tech: 'tech',
	Health: 'health',
	Entertainment: 'entertainment'
};

// Build reverse lookup only from defined entries
export const SLUG_TO_CAT: Record<string, Category> = Object.fromEntries(
	Object.entries(CAT_TO_SLUG).map(([cat, slug]) => [slug as string, cat as Category])
) as Record<string, Category>;

export function catFromSlug(slug?: string): Category | null {
	if (!slug) return null;
	return SLUG_TO_CAT[slug.toLowerCase()] ?? null;
}
