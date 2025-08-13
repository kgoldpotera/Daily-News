import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Article } from '$lib/types';

export type MetaKV = { key: string; value: unknown };

class NewsDB extends Dexie {
	articles!: Table<Article, string>;
	meta!: Table<MetaKV, string>;

	constructor() {
		super('kenyanow');
		this.version(1).stores({
			// id (PK), publishedAt for sorting, category for filtering, source for debugging
			articles: 'id, publishedAt, category, source',
			meta: 'key'
		});
	}
}

export const db = new NewsDB();

export async function putArticles(items: Article[]) {
	if (!items?.length) return 0;
	await db.articles.bulkPut(items);
	return items.length;
}

export async function latest(limit = 40): Promise<Article[]> {
	return db.articles.orderBy('publishedAt').reverse().limit(limit).toArray();
}

export async function byCategory(cat: string, limit = 30, offset = 0): Promise<Article[]> {
	const rows = await db.articles.where('category').equals(cat).toArray();
	return rows
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
		.slice(offset, offset + limit);
}

export async function countCategory(cat: string) {
	return db.articles.where('category').equals(cat).count();
}
