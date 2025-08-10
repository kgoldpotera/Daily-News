const rules: Record<string, RegExp[]> = {
	Politics: [/parliament|senate|mp\b|president|election|cabinet|gazette/i],
	Business: [/market|economy|bank|trade|company|stock|shilling/i],
	Sports: [/match|league|cup|athletics|goal|olympic|sport/i],
	Tech: [/technology|startup|app|software|spectrum|internet|ai\b/i],
	Health: [/health|hospital|clinic|disease|vaccine|malaria|covid/i],
	Entertainment: [/music|film|celebrity|arts?|festival|entertainment/i]
};

export function mapCategoryFrom(title: string, tags: string[] = []): string | undefined {
	const hay = [title, ...tags].join(' ');
	for (const [cat, res] of Object.entries(rules)) {
		if (res.some((r) => r.test(hay))) return cat;
	}
	return undefined;
}
