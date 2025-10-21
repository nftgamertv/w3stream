import WaitlistConfirmationEmail from '@/emails/waitlist-confirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      console.error('[Waitlist API] Missing required fields:', { name: !!name, email: !!email });
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Welcome to Our Private Beta Waitlist!',
      react: WaitlistConfirmationEmail({ name }),
    });

    console.log('[Waitlist API] Email sent successfully:', {
      id: (data as any)?.id,
      to: email,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Waitlist API] Exception:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
