import type { Category } from '$lib/types';

export const CAT_TO_SLUG: Record<Category, string> = {
	Business: 'business',
	Sports: 'sports',
	Tech: 'tech',
	Health: 'health',
	Entertainment: 'entertainment'
};

export const SLUG_TO_CAT: Record<string, Category> = Object.fromEntries(
	(Object.entries(CAT_TO_SLUG) as [Category, string][]).map(([cat, slug]) => [slug, cat])
) as Record<string, Category>;

export function catFromSlug(slug?: string): Category | null {
	if (!slug) return null;
	return SLUG_TO_CAT[slug.toLowerCase()] ?? null;
}
