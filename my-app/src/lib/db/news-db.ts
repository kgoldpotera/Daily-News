// src/lib/db/news-db.ts
import Dexie, { type Table } from 'dexie';
import type { Article } from '$lib/types';

export type CachedArticle = Article & {
	id: string; // ensure we always have an id
	feed: 'kenya' | 'global'; // which feed this came from
	cachedAt: number; // Date.now()
};

class NewsDB extends Dexie {
	articles!: Table<CachedArticle, string>; // primary key: id

	constructor() {
		super('news-db');
		// Index by feed for quick filtering; id is primary key
		this.version(1).stores({
			articles: 'id, feed, cachedAt'
		});
	}
}

export const db = new NewsDB();

/** Helper: upsert a batch and trim to keep DB small */
export async function upsertArticles(feed: 'kenya' | 'global', list: Article[]) {
	const now = Date.now();
	// Trust server `id`; if missing, fallback to url
	const items: CachedArticle[] = list
		.filter((a) => a && (a.id || a.url))
		.map((a) => ({
			...a,
			id: a.id ?? a.url, // fallback if id not present
			feed,
			cachedAt: now
		}));

	await db.transaction('rw', db.articles, async () => {
		await db.articles.bulkPut(items);

		// keep the newest ~400 per feed
		const all = await db.articles.where('feed').equals(feed).toArray();
		all.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
		const toDelete = all.slice(400);
		if (toDelete.length) await db.articles.bulkDelete(toDelete.map((x) => x.id));
	});
}

/** Get most recent items from a feed (client-side only) */
export async function getRecent(feed: 'kenya' | 'global', limit = 60): Promise<Article[]> {
	const all = await db.articles.where('feed').equals(feed).toArray();
	all.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
	return all.slice(0, limit);
}
