export function toPlainText(html?: string): string {
	if (!html) return '';
	// basic decode for common entities
	const unescaped = html.replace(/&nbsp;/g, ' ').replace(/&#8217;/g, '’');
	// strip tags
	const text = unescaped.replace(/<[^>]*>/g, ' ');
	// collapse whitespace
	return text.replace(/\s+/g, ' ').trim();
}
