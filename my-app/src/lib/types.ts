export type Article = {
	id: string;
	source: string;
	title: string;
	url: string;
	excerpt?: string;
	summary?: string;
	category?: string;
	publishedAt: string; // ISO
};
