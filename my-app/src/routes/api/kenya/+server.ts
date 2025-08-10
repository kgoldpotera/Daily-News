import type { RequestHandler } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'crypto';
import { mapCategoryFrom } from '$lib/utils/categories';
import type { Article } from '$lib/types';
import { toPlainText } from '$lib/utils/sanitize';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const FEEDS = [
	'https://www.standardmedia.co.ke/rss/headlines.php',
	'https://www.capitalfm.co.ke/news/feed/',
	'https://www.kbc.co.ke/feed/'
];

const idFor = (url: string, title: string) =>
	createHash('md5')
		.update((url || '') + (title || ''))
		.digest('hex');

type RssItem = {
	title?: string;
	link?: string;
	description?: string;
	pubDate?: string;
	category?: string | string[];
};

type RssChannel = {
	title?: string;
	item?: RssItem | RssItem[];
};

type RssDoc = {
	rss?: { channel?: RssChannel };
	channel?: RssChannel;
};

async function fetchText(url: string, timeoutMs = 12000): Promise<string> {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'SvelteNews/0.2',
				Accept: 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8'
			},
			redirect: 'follow',
			signal: ctrl.signal
		});
		if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
		return await res.text();
	} finally {
		clearTimeout(t);
	}
}

function normalize(xml: string, url: string): Article[] {
	const j = parser.parse(xml) as RssDoc;
	const channel = j?.rss?.channel ?? j?.channel ?? {};
	const raw: RssItem[] = Array.isArray(channel.item)
		? channel.item
		: channel.item
			? [channel.item]
			: [];
	const source = channel.title || new URL(url).hostname;

	return raw
		.map((i) => {
			const tags = i?.category
				? Array.isArray(i.category)
					? i.category.map(String)
					: [String(i.category)]
				: [];
			const title = i?.title ?? '';
			const link = i?.link ?? '';
			return {
				id: idFor(link, title),
				source,
				title,
				url: link,
				excerpt: i?.description ?? '',
				category: mapCategoryFrom(title, tags),
				publishedAt: i?.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
			} satisfies Article;
		})
		.filter((a) => a.title && a.url);
}

export const GET: RequestHandler = async () => {
	const results = await Promise.allSettled(
		FEEDS.map(async (u) => {
			try {
				return normalize(await fetchText(u), u);
			} catch {
				return [] as Article[];
			}
		})
	);

	const merged = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
	const deduped = merged
		.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

	if (deduped.length === 0) {
		return new Response(JSON.stringify({ items: [], error: 'All feeds failed.' }), {
			status: 502,
			headers: { 'content-type': 'application/json' }
		});
	}
	return new Response(JSON.stringify({ items: deduped }), {
		headers: { 'content-type': 'application/json' }
	});
};

