import type { RequestHandler } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';
import { mapCategoryFrom } from '$lib/utils/categories';
import { toPlainText } from '$lib/utils/sanitize';
import { getCached, setCached } from '$lib/server/cache';
import type { Article } from '$lib/types';
import { KENYAN_HOSTS } from '$lib/sources/kenya';
import { fetchOgImage } from '$lib/server/og-image';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

/** RSS/Atom feeds from Kenyan outlets (extend as needed) */
const FEEDS: string[] = [
	'https://www.standardmedia.co.ke/rss/headlines.php',
	'https://www.capitalfm.co.ke/news/feed/',
	'https://www.kbc.co.ke/feed/'
];

const idFor = (url: string, title: string) =>
	createHash('md5')
		.update((url || '') + (title || ''))
		.digest('hex');

/** ---- Kenya relevance heuristics ---- */
const COUNTIES = [
	'Nairobi',
	'Mombasa',
	'Kisumu',
	'Nakuru',
	'Uasin Gishu',
	'Kiambu',
	'Machakos',
	'Kajiado',
	'Murang’a',
	'Nyeri',
	'Meru',
	'Embu',
	'Kirinyaga',
	'Laikipia',
	'Tharaka-Nithi',
	'Kilifi',
	'Kwale',
	'Taita-Taveta',
	'Tana River',
	'Lamu',
	'Garissa',
	'Wajir',
	'Mandera',
	'Marsabit',
	'Isiolo',
	'Samburu',
	'Turkana',
	'West Pokot',
	'Baringo',
	'Elgeyo-Marakwet',
	'Nandi',
	'Bomet',
	'Kericho',
	'Narok',
	'Homa Bay',
	'Migori',
	'Kisii',
	'Nyamira',
	'Siaya',
	'Busia',
	'Vihiga',
	'Bungoma',
	'Kakamega',
	'Trans Nzoia',
	'Kitui',
	'Makueni'
];
const KENYA_TERMS = [
	'kenya',
	'kenyan',
	'nairobi',
	'ksh',
	'kshs',
	'shillings',
	'iebc',
	'kdf',
	'kplc',
	'kra',
	'ntsa',
	'eacc',
	'huduma',
	'state house',
	'county assembly',
	'governor',
	'mp ',
	'mca ',
	'cs ',
	'cabinet secretary',
	'safaricom',
	'equity bank',
	'kcb',
	'harambee stars',
	'shujaa',
	'gor mahia',
	'afc leopards'
];
const GLOBAL_EXCLUDE_HINTS = [
	'ukraine',
	'russia',
	'moscow',
	'kyiv',
	'israel',
	'gaza',
	'european union',
	'eu ',
	'nato',
	'biden',
	'trump',
	'britain',
	'france',
	'germany',
	'china',
	'beijing',
	'india',
	'japan',
	'tokyo',
	'seoul',
	'australia',
	'canada'
];

function hasAny(hay: string, list: string[]): boolean {
	const s = ` ${hay.toLowerCase()} `;
	return list.some((w) => s.includes(` ${w.toLowerCase()} `));
}
function hasCounty(hay: string): boolean {
	const l = hay.toLowerCase();
	return COUNTIES.some((c) =>
		new RegExp(`\\b${c.toLowerCase().replace(/[-.]/g, '\\$&')}\\b`).test(l)
	);
}
function isKenyaRelevant(title: string, excerpt: string, tags: string[]): boolean {
	const hay = [title, excerpt, ...tags].join(' ').toLowerCase();
	if (hay.includes(' kenya ') || hay.includes(' kenyan ')) return true;
	if (hasCounty(hay)) return true;
	if (hasAny(hay, KENYA_TERMS)) return true;
	if (tags.some((t) => /kenya|county|counties|nairobi/i.test(t))) return true;
	if (hasAny(hay, GLOBAL_EXCLUDE_HINTS)) return false;
	return true;
}
/** ------------------------------------ */

type RssItem = {
	title?: string;
	link?: string;
	description?: string;
	pubDate?: string;
	category?: string | string[];
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

function isAllowedHost(h: string): boolean {
	// allow subdomains of approved Kenyan hosts
	return KENYAN_HOSTS.some((allow) => h === allow || h.endsWith(`.${allow}`));
}

async function fetchText(url: string, ttlMs = 5 * 60_000, timeoutMs = 12_000): Promise<string> {
	const cached = getCached(url, ttlMs);
	const headers: Record<string, string> = {
		'User-Agent': 'SvelteNews/0.3',
		Accept: 'application/rss+xml,application/xml;q=0.9,*/*;q=0.8'
	};
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

function normalize(xml: string, feedUrl: string): Article[] {
	const j = parser.parse(xml) as RssDoc;
	const channel = j?.rss?.channel ?? j?.channel ?? {};
	const raw: RssItem[] = Array.isArray(channel.item)
		? channel.item
		: channel.item
			? [channel.item]
			: [];
	const source = channel.title || new URL(feedUrl).hostname;

	const mapped = raw.map((i) => {
		const tags = i?.category
			? Array.isArray(i.category)
				? i.category.map(String)
				: [String(i.category)]
			: [];
		const title = i?.title ?? '';
		const link = i?.link ?? '';
		const excerpt = toPlainText(i?.description);

		// Host allow-list: only keep Kenyan domains
		try {
			const h = new URL(link).hostname;
			if (!isAllowedHost(h)) return null;
		} catch {
			return null;
		}

		// Kenya relevance heuristic
		if (!isKenyaRelevant(title, excerpt, tags)) return null;

		return {
			id: idFor(link, title),
			source,
			title,
			url: link,
			image: extractImage(i),
			excerpt,
			category: mapCategoryFrom(title, tags),
			publishedAt: i?.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
		} as Article | null;
	});

	return mapped
		.filter((a): a is Article => a !== null)
		.filter((a) => a.title !== '' && a.url !== '');
}

export const GET: RequestHandler = async () => {
	const results = await Promise.allSettled<Article[]>(
		FEEDS.map(async (u: string) => {
			try {
				return normalize(await fetchText(u), u);
			} catch {
				return [] as Article[];
			}
		})
	);

	const merged: Article[] = results.flatMap((r: PromiseSettledResult<Article[]>) =>
		r.status === 'fulfilled' ? r.value : []
	);
	const deduped: Article[] = merged
		.filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i)
		.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

	if (deduped.length === 0) {
		return new Response(
			JSON.stringify({ items: [], error: 'All feeds failed or were filtered as non‑Kenyan.' }),
			{ status: 502, headers: { 'content-type': 'application/json' } }
		);
	}

	// Add og:image fallback where missing (limit for speed)
	const withImages: Article[] = await Promise.all(
		deduped.slice(0, 30).map(async (a: Article) => {
			if (!a.image) {
				const og = await fetchOgImage(a.url);
				if (og) a.image = og;
			}
			return a;
		})
	);

	return new Response(JSON.stringify({ items: withImages }), {
		headers: { 'content-type': 'application/json' }
	});
};
