export type Article = {
	id?: string;
	source: string;
	title: string;
	url: string;
	image?: string; // ← new
	excerpt?: string;
	summary?: string;
	category?: string;
	publishedAt: string;
};
