import type { PageLoad } from './$types';
import type { Article } from '$lib/types';
import { catFromSlug } from '$lib/utils/cat-slug';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const cat = catFromSlug(params.section);
	if (!cat) return { cat: null, items: [], total: 0, page: 1, pageSize: 20, hasMore: false };

	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
	const pageSize = Math.min(40, Math.max(6, Number(url.searchParams.get('size') ?? '20')));

	const [keR, glR] = await Promise.all([
		fetch('/api/kenya', { cache: 'no-store' }),
		fetch('/api/global', { cache: 'no-store' })
	]);
	const [keJ, glJ] = await Promise.all([keR.json(), glR.json()]);

	const all: Article[] = [...(keJ.items ?? []), ...(glJ.items ?? [])]
		.filter((a: Article) => a.category === cat)
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

	const start = (page - 1) * pageSize;
	const items = all.slice(start, start + pageSize);
	const hasMore = start + pageSize < all.length;

	return { cat, items, total: all.length, page, pageSize, hasMore };
};
