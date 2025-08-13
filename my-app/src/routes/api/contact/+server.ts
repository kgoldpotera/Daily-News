import { json } from '@sveltejs/kit';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Optional: tweak this to your verified sender. While testing you can use onboarding@resend.dev.
const FROM = 'SpotlightKE <onboarding@resend.dev>';
const TO = ['koechmanoah32@gmail.com', 'musandu@gmail.com'];

export async function POST({ request }) {
	try {
		const formData = await request.formData();

		const name = String(formData.get('name') ?? '');
		const email = String(formData.get('email') ?? '');
		const phone = String(formData.get('phone') ?? '');
		const subject = String(formData.get('subject') ?? 'Contact');
		const message = String(formData.get('message') ?? '');

		// Handle optional attachment
		const file = formData.get('attachment') as File | null;
		const attachments =
			file && file.size > 0
				? [
						{
							filename: file.name,
							content: Buffer.from(await file.arrayBuffer())
						}
					]
				: undefined;

		const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">
        <h2 style="margin:0 0 8px">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa">${escapeHtml(
					message
				)}</div>
      </div>
    `;

		// Send to both inboxes
		const result = await resend.emails.send({
			from: FROM,
			to: TO,
			reply_to: email || undefined, // lets you reply directly to sender
			subject: `Contact Form: ${subject}`,
			html,
			attachments
		});

		if (result.error) {
			console.error(result.error);
			return json({ success: false, error: 'Email provider error' }, { status: 502 });
		}

		return json({ success: true });
	} catch (err) {
		console.error(err);
		return json({ success: false, error: 'Failed to send email' }, { status: 500 });
	}
}

// Basic HTML escaping to be safe in the email body
function escapeHtml(input: string) {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
