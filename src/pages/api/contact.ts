export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get('name')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const message = data.get('message')?.toString().trim();

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400 });
  }

  try {
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ') || undefined;

    await Promise.all([
      resend.emails.send({
        from: 'treyknowles.com <noreply@treyknowles.com>',
        to: 'knowles.trey.t@gmail.com',
        replyTo: email,
        subject: `New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
      resend.contacts.create({ email, firstName, lastName }),
    ]);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send. Please try again.' }), { status: 500 });
  }
};
