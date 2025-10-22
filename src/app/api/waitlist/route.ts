import WaitlistConfirmationEmail from '@/emails/waitlist-confirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, recaptchaToken } = body;

    // Verify reCAPTCHA token first
    if (!recaptchaToken) {
      console.error('[Waitlist API] Missing reCAPTCHA token');
      return NextResponse.json({ error: 'reCAPTCHA verification required' }, { status: 400 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    
    const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      console.error('[Waitlist API] reCAPTCHA verification failed:', recaptchaData);
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
    }

    if (!name || !email) {
      console.error('[Waitlist API] Missing required fields:', { name: !!name, email: !!email });
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Thank you for joining the w3Stream waitlist!',
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