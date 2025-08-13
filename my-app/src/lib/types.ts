// Keep categories aligned with your header (no Politics route right now)
export type Category = 'Business' | 'Sports' | 'Tech' | 'Health' | 'Entertainment';

export type Article = {
	id: string;
	source: string;
	title: string;
	url: string;
	image?: string;
	excerpt?: string;
	summary?: string;
	category?: Category;
	publishedAt: string; // ISO
};
