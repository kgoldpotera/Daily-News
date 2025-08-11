import type { RequestHandler } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import crypto from 'node:crypto';
import { summarizeToSentences } from '$lib/utils/summarize';
import { mapCategoryFrom } from '$lib/utils/categories';
import type { Article } from '$lib/types';
import { fetchOgImage } from '$lib/server/og-image';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

/** Global feeds (extend as needed) */
const FEEDS: string[] = [
	'https://feeds.reuters.com/reuters/topNews',
	'https://www.aljazeera.com/xml/rss/all.xml',
	'http://feeds.bbci.co.uk/news/world/rss.xml',
	'http://rss.cnn.com/rss/edition.rss'
];

const idFor = (url: string, title: string) =>
	crypto
		.createHash('md5')
		.update((url || '') + (title || ''))
		.digest('hex');

/** --- Minimal RSS types to avoid `any` --- */
type RssItem = {
	title?: string;
	link?: string;
	description?: string;
	summary?: string;
	pubDate?: string;
	category?: string | string[];
	enclosure?: { url?: string };
	['media:content']?: { url?: string };
	['media:thumbnail']?: { url?: string };
};
type RssChannel = { title?: string; item?: RssItem | RssItem[] };
type RssDoc = { rss?: { channel?: RssChannel }; channel?: RssChannel };

export const GET: RequestHandler = async () => {
	const lists = await Promise.allSettled<Article[]>(
		FEEDS.map(async (url: string) => {
			const res = await fetch(url, {
				headers: {
					'User-Agent': 'KenyaNow/0.3',
					// hint upstream + proxies not to cache
					'Cache-Control': 'no-cache'
				}
			});
			if (!res.ok) throw new Error(String(res.status));
			const xml = await res.text();

			const j = parser.parse(xml) as RssDoc;
			const ch: RssChannel | undefined = j?.rss?.channel ?? j?.channel;

			const raw: RssItem[] = Array.isArray(ch?.item)
				? (ch!.item as RssItem[])
				: ch?.item
					? [ch.item as RssItem]
					: [];

			const source = ch?.title || new URL(url).hostname;

			return raw.map((i): Article => {
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
					image: i?.enclosure?.url || i?.['media:content']?.url || i?.['media:thumbnail']?.url,
					summary: summarizeToSentences(desc, 3),
					category: mapCategoryFrom(title, tags),
					publishedAt: i?.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
				};
			});
		})
	);

	const merged: Article[] = lists.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
	const deduped: Article[] = merged
		.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

	// Fallback to og:image for items without an image (first 30 for speed)
	const withImages: Article[] = await Promise.all(
		deduped.slice(0, 30).map(async (a) => {
			if (!a.image) {
				const og = await fetchOgImage(a.url);
				if (og) a.image = og;
			}
			return a;
		})
	);

	return new Response(
		JSON.stringify({
			items: withImages,
			fetchedAt: new Date().toISOString() // handy for debugging freshness
		}),
		{
			headers: {
				'content-type': 'application/json',
				// make sure the browser / proxies don’t cache
				'cache-control': 'no-store, max-age=0, must-revalidate',
				pragma: 'no-cache',
				expires: '0',
				// if you’re behind a CDN, this helps too:
				'CDN-Cache-Control': 'no-store'
			}
		}
	);
};
