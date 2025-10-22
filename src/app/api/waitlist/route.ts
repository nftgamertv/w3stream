import WaitlistConfirmationEmail from '@/emails/waitlist-confirmation';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, recaptchaToken } = body;

    // Verify reCAPTCHA v3 token
    if (!recaptchaToken) {
      console.error('[Waitlist API] Missing reCAPTCHA token');
      return NextResponse.json({ error: 'reCAPTCHA verification required' }, { status: 400 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const verificationBody = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: recaptchaToken,
    });

    const recaptchaResponse = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationBody,
    });
    const recaptchaData = await recaptchaResponse.json();

    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 1.0 is very likely a good interaction, 0.0 is very likely a bot
    if (!recaptchaData.success) {
      console.error('[Waitlist API] reCAPTCHA verification failed:', recaptchaData);
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
    }

    // Verify the action matches what we expect
    if (recaptchaData.action !== 'submit_waitlist') {
      console.error('[Waitlist API] Invalid reCAPTCHA action:', recaptchaData.action);
      return NextResponse.json({ error: 'Invalid reCAPTCHA action' }, { status: 400 });
    }

    // Check the score - you can adjust this threshold (0.5 is recommended default)
    const scoreThreshold = 0.5;
    if (recaptchaData.score < scoreThreshold) {
      console.warn('[Waitlist API] Low reCAPTCHA score:', {
        score: recaptchaData.score,
        threshold: scoreThreshold,
        email: email,
      });
      return NextResponse.json({
        error: 'Your submission appears suspicious. Please try again or contact support.'
      }, { status: 400 });
    }

    console.log('[Waitlist API] reCAPTCHA verification successful:', {
      score: recaptchaData.score,
      action: recaptchaData.action,
    });

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