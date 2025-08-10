import type { RequestHandler } from '@sveltejs/kit';
import { getSources, updateSource } from '$lib/server/admin_store';

export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({ items: getSources() }), {
		headers: { 'content-type': 'application/json' }
	});
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id, active, ttlMs, url, label } = body as {
			id: string;
			active?: boolean;
			ttlMs?: number;
			url?: string;
			label?: string;
		};
		if (!id) {
			return new Response(JSON.stringify({ error: 'Missing id' }), {
				status: 400,
				headers: { 'content-type': 'application/json' }
			});
		}
		const updated = updateSource(id, { active, ttlMs, url, label });
		if (!updated) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404,
				headers: { 'content-type': 'application/json' }
			});
		}
		return new Response(JSON.stringify({ item: updated }), {
			headers: { 'content-type': 'application/json' }
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: String(e) }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}
};
