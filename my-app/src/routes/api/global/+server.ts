import type { RequestHandler } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'crypto';
import { summarizeToSentences } from '$lib/utils/summarize';
import { mapCategoryFrom } from '$lib/utils/categories';
import type { Article } from '$lib/types';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

// Use https where available
const FEEDS = [
	'https://feeds.reuters.com/reuters/topNews',
	'https://www.aljazeera.com/xml/rss/all.xml',
	'https://feeds.bbci.co.uk/news/world/rss.xml',
	'https://rss.cnn.com/rss/edition.rss'
];

const idFor = (url: string, title: string) =>
	createHash('md5')
		.update((url || '') + (title || ''))
		.digest('hex');

type RssItem = {
	title?: string;
	link?: string;
	description?: string;
	summary?: string;
	category?: string | string[];
	pubDate?: string;
};

type RssChannel = {
	title?: string;
	item?: RssItem | RssItem[];
};

type RssDoc = {
	rss?: { channel?: RssChannel };
	channel?: RssChannel;
};

export const GET: RequestHandler = async () => {
	const lists = await Promise.allSettled(
		FEEDS.map(async (url) => {
			const res = await fetch(url, { headers: { 'User-Agent': 'SvelteNews/0.2' } });
			if (!res.ok) throw new Error(String(res.status));
			const xml = await res.text();

			const j = parser.parse(xml) as RssDoc;
			const ch = j?.rss?.channel ?? j?.channel ?? {};
			const raw = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];

			const source = ch.title || new URL(url).hostname;

			const articles: Article[] = raw.map((i) => {
				const title = i?.title ?? '';
				const link = i?.link ?? '';
				const desc = i?.description ?? i?.summary ?? '';
				const tags = i?.category
					? Array.isArray(i.category)
						? i.category.map(String)
						: [String(i.category)]
					: [];

				return {
					id: idFor(link, title),
					source,
					title,
					url: link,
					summary: summarizeToSentences(desc, 3),
					category: mapCategoryFrom(title, tags),
					publishedAt: i?.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
				};
			});

			return articles;
		})
	);

	const merged: Article[] = lists.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
	const deduped = merged
		.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

	return new Response(JSON.stringify({ items: deduped }), {
		headers: { 'content-type': 'application/json' }
	});
};
