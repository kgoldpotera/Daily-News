// Simple in-process cache (resets on server restart)
type Item = { body: string; etag?: string; lastMod?: string; ts: number };
const store = new Map<string, Item>();

export function getCached(url: string, ttlMs: number): Item | undefined {
	const v = store.get(url);
	if (!v) return;
	if (Date.now() - v.ts > ttlMs) return; // stale
	return v;
}
export function setCached(url: string, item: Item) {
	store.set(url, item);
}
