// src/lib/types.ts

// Canonical categories we use across the app
export type Category = 'Politics' | 'Business' | 'Sports' | 'Tech' | 'Health' | 'Entertainment';

// Normalized article shape
export type Article = {
	id?: string;
	source: string;
	title: string;
	url: string;
	image?: string;
	excerpt?: string;
	summary?: string;

	// Keep union for compatibility while we migrate utils/mapCategoryFrom
	// Later we can tighten this to just `Category`.
	category?: Category | string;

	publishedAt: string; // ISO
};
