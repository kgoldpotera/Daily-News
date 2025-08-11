import { getCached, setCached } from '$lib/server/cache';

const UA = 'KenyaNow/0.4';

function absolute(url: string, base: string) {
	try {
		return new URL(url, base).toString();
	} catch {
		return undefined;
	}
}

export async function fetchOgImage(
	articleUrl: string,
	ttlMs = 30 * 60_000
): Promise<string | undefined> {
	const cacheKey = `og:${articleUrl}`;
	const cached = getCached(cacheKey, ttlMs);
	if (cached?.body) return cached.body as string;

	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 10_000);

	try {
		const res = await fetch(articleUrl, {
			headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
			redirect: 'follow',
			signal: ctrl.signal
		});
		if (!res.ok) return undefined;
		const html = await res.text();

		const mOg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
		const mTw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
		const mLink = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
		const raw = mOg?.[1] || mTw?.[1] || mLink?.[1];
		if (!raw) return undefined;

		const img = absolute(raw, articleUrl);
		if (!img || !/^https?:\/\//i.test(img)) return undefined;

		setCached(cacheKey, { body: img, ts: Date.now() });
		return img;
	} catch {
		return undefined;
	} finally {
		clearTimeout(t);
	}
}
