import type { RequestHandler } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'crypto';
import { summarizeToSentences } from '$lib/utils/summarize';
import { mapCategoryFrom } from '$lib/utils/categories';
import { toPlainText } from '$lib/utils/sanitize';
import { getCached, setCached } from '$lib/server/cache';
import type { Article } from '$lib/types';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

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
	enclosure?: { url?: string };
	['media:content']?: { url?: string };
	['media:thumbnail']?: { url?: string };
	['content:encoded']?: string;
};
type RssChannel = { title?: string; item?: RssItem | RssItem[] };
type RssDoc = { rss?: { channel?: RssChannel }; channel?: RssChannel };

function extractImage(it: RssItem): string | undefined {
	if (it['media:content']?.url) return String(it['media:content']!.url);
	if (it['media:thumbnail']?.url) return String(it['media:thumbnail']!.url);
	if (it.enclosure?.url) return String(it.enclosure.url);
	const content = it['content:encoded'];
	if (typeof content === 'string') {
		const m = content.match(/<img[^>]+src="([^"]+)"/i);
		if (m) return m[1];
	}
	return undefined;
}

async function fetchText(url: string, ttlMs = 5 * 60_000, timeoutMs = 12_000): Promise<string> {
	const cached = getCached(url, ttlMs);
	const headers: Record<string, string> = { 'User-Agent': 'SvelteNews/0.3' };
	if (cached?.etag) headers['If-None-Match'] = cached.etag;
	if (cached?.lastMod) headers['If-Modified-Since'] = cached.lastMod;

	async function once(signal: AbortSignal) {
		const res = await fetch(url, { headers, redirect: 'follow', signal });
		if (res.status === 304 && cached) return cached.body;
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const body = await res.text();
		setCached(url, {
			body,
			etag: res.headers.get('etag') ?? undefined,
			lastMod: res.headers.get('last-modified') ?? undefined,
			ts: Date.now()
		});
		return body;
	}

	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		try {
			return await once(ctrl.signal);
		} catch {
			await new Promise((r) => setTimeout(r, 500));
			return await once(ctrl.signal);
		}

	} finally {
		clearTimeout(t);
	}
}

export const GET: RequestHandler = async () => {
	const lists = await Promise.allSettled(
		FEEDS.map(async (url) => {
			const xml = await fetchText(url);
			const j = parser.parse(xml) as RssDoc;
			const ch = j?.rss?.channel ?? j?.channel ?? {};
			const items: RssItem[] = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
			const source = ch.title || new URL(url).hostname;

			return items.map((i) => {
				const title = i?.title ?? '';
				const link = i?.link ?? '';
				const desc = toPlainText(i?.description ?? i?.summary);
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
					image: extractImage(i),
					summary: summarizeToSentences(desc, 3),
					category: mapCategoryFrom(title, tags),
					publishedAt: i?.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
				} as Article;
			});
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
