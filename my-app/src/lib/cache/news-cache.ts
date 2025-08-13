import type { Article, Category } from '$lib/types';
import { putArticles, latest, byCategory, countCategory } from '$lib/db/news-db';
import { catFromSlug } from '$lib/utils/cat-slug';

// simple de-dupe by id (or fallback)
function dedupe(items: Article[]): Article[] {
	const seen = new Set<string>();
	const out: Article[] = [];
	for (const a of items) {
		const key = a.id ?? `${a.url}|${a.title}`;
		if (!seen.has(key)) {
			seen.add(key);
			out.push(a);
		}
	}
	return out;
}

async function fetchAPIs(): Promise<Article[]> {
	const [ke, gl] = await Promise.all([
		fetch('/api/kenya', { cache: 'no-store' })
			.then((r) => r.json())
			.catch(() => ({ items: [] })),
		fetch('/api/global', { cache: 'no-store' })
			.then((r) => r.json())
			.catch(() => ({ items: [] }))
	]);
	const merged = [...(ke.items ?? []), ...(gl.items ?? [])] as Article[];
	return dedupe(merged);
}

/** Home: cache-first, then refresh in the background and emit "news-refresh" (scope: 'home') */
export async function loadHomeCacheFirst(): Promise<Article[]> {
	const cached = await latest(60);
	(async () => {
		const live = await fetchAPIs();
		if (live.length) {
			await putArticles(live);
			window.dispatchEvent(new CustomEvent('news-refresh', { detail: { scope: 'home' } }));
		}
	})();
	return cached;
}

/** Category: cache-first, then background refresh and emit "news-refresh" (scope: slug) */
export async function loadCategoryCacheFirst(
	slug: string,
	page: number,
	size: number
): Promise<{ rows: Article[]; total: number }> {
	const cat = catFromSlug(slug) as Category | null;
	if (!cat) return { rows: [], total: 0 };

	const total = await countCategory(cat);
	const offset = (page - 1) * size;
	const rows = await byCategory(cat, size, offset);

	(async () => {
		const live = await fetchAPIs();
		if (live.length) {
			await putArticles(live);
			window.dispatchEvent(new CustomEvent('news-refresh', { detail: { scope: slug } }));
		}
	})();

	return { rows, total };
}
