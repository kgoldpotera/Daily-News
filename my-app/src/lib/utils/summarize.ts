export function summarizeToSentences(text: string, max = 3): string {
	if (!text) return '';
	const clean = text.replace(/\s+/g, ' ');
	const sentences = clean.split(/(?<=[.!?])\s+/).slice(0, max);
	return sentences.join(' ');
}
