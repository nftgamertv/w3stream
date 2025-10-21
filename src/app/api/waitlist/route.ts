import type { NextApiRequest, NextApiResponse } from 'next';
import WaitlistConfirmationEmail from '@/emails/waitlist-confirmation';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, email } = req.body; 

    if (!name || !email) {
      console.error('[Waitlist API] Missing required fields:', { name: !!name, email: !!email });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Welcome to Our Private Beta Waitlist!',
      react: WaitlistConfirmationEmail({ name }),
    });

    if (error) {
      console.error('[Waitlist API] Resend error:', {
        error,
        email,
        name,
      });
      return res.status(400).json(error);
    }

    console.log('[Waitlist API] Email sent successfully:', {
      id: data?.id,
      to: email,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('[Waitlist API] Exception:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};
