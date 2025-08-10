export function toPlainText(html?: string): string {
	if (!html) return '';
	const unescaped = html
		.replace(/&nbsp;/g, ' ')
		.replace(/&#8217;/g, '’')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
	const text = unescaped.replace(/<[^>]*>/g, ' ');
	return text.replace(/\s+/g, ' ').trim();
}
