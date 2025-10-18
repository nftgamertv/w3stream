import { NextResponse } from "next/server"
import { Resend } from "resend"
import WaitlistConfirmationEmail from "@/emails/waitlist-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Send confirmation email to the user
    await resend.emails.send({
      from: 'w3Stream <onboarding@w3stream.com>',
      to: data.email,
      subject: 'Welcome to the w3Stream Waitlist!',
      react: WaitlistConfirmationEmail({ name: data.name }),
    })

    // You can also send a notification to your team
    // await resend.emails.send({
    //   from: 'w3Stream <notifications@w3stream.com>',
    //   to: 'team@w3stream.com',
    //   subject: 'New Waitlist Signup',
    //   react: NewSignupNotification(data),
    // })

    console.log("[v0] Waitlist submission received:", data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing waitlist submission:", error)
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 })
  }
}
