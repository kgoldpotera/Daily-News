export type RssSource = {
	id: string;
	label: string;
	url: string;
	ttlMs?: number; // override cache TTL per source (optional)
	active?: boolean; // toggle without deleting
};

export const KENYAN_HOSTS = [
	'standardmedia.co.ke',
	'capitalfm.co.ke',
	'kbc.co.ke',
	'citizen.digital',
	'the-star.co.ke',
	'nation.africa',
	'pd.co.ke',
	'kenyans.co.ke',
	'tuko.co.ke',
	'ntvkenya.co.ke', // if you add NTV feeds later
	'ktnnews.co.ke' // if you add KTN later
].sort();

// Start with a few known-good RSS feeds (keep risky ones inactive until verified)
export const KENYA_SOURCES: RssSource[] = [
	{
		id: 'standard',
		label: 'Standard',
		url: 'https://www.standardmedia.co.ke/rss/headlines.php',
		active: true
	},
	{
		id: 'capital',
		label: 'Capital FM',
		url: 'https://www.capitalfm.co.ke/news/feed/',
		active: true
	},
	{ id: 'kbc', label: 'KBC', url: 'https://www.kbc.co.ke/feed/', active: true },

	// Add these one by one after you test them in the browser:
	{ id: 'citizen', label: 'Citizen TV', url: 'https://citizen.digital/rss', active: false },
	{ id: 'people', label: 'People Daily', url: 'https://www.pd.co.ke/feed/', active: true },
	{
		id: 'nation',
		label: 'Nation (verify endpoint)',
		url: 'https://nation.africa/kenya/rss.xml',
		active: true
	},
	{
		id: 'star',
		label: 'The Star (verify endpoint)',
		url: 'https://www.the-star.co.ke/rss/',
		active: false
	},
	{
		id: 'kenyans',
		label: 'Kenyans.co.ke (verify)',
		url: 'https://www.kenyans.co.ke/rss',
		active: false
	},
	{ id: 'tuko', label: 'Tuko (verify)', url: 'https://www.tuko.co.ke/rss', active: false }
];
