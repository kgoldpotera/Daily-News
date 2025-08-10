import { KENYA_SOURCES } from '$lib/sources/kenya';

export type AdminSource = {
	id: string;
	label: string;
	url: string;
	ttlMs?: number;
	active?: boolean;
};

let sources: AdminSource[] = KENYA_SOURCES.map((s) => ({ ...s })); // mutable copy

export function getSources(): AdminSource[] {
	return sources.map((s) => ({ ...s }));
}

export function updateSource(id: string, patch: Partial<AdminSource>): AdminSource | null {
	const idx = sources.findIndex((s) => s.id === id);
	if (idx === -1) return null;
	const merged = { ...sources[idx], ...patch };
	// sanity guards
	if (merged.ttlMs !== undefined && (isNaN(merged.ttlMs) || merged.ttlMs < 10_000)) {
		merged.ttlMs = 10_000;
	}
	sources[idx] = merged;
	return { ...sources[idx] };
}

export function setAll(next: AdminSource[]) {
	sources = next.map((s) => ({ ...s }));
}
