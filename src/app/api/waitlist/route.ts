import { NextResponse } from "next/server"
import { Resend } from "resend"
import WaitlistConfirmationEmail from "@/emails/waitlist-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const projectId = process.env.RECAPTCHA_PROJECT_ID || 'soy-radius-475713-k3'
    const apiKey = process.env.RECAPTCHA_API_KEY

    if (!apiKey) {
      console.error('RECAPTCHA_API_KEY not configured')
      return { success: false, error: 'reCAPTCHA verification not configured' }
    }

    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token: token,
            expectedAction: 'WAITLIST_SUBMIT',
            siteKey: '6LcEEfErAAAAAJoE9c5PrX1uJcAGv6OZx-pY1VYY',
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('reCAPTCHA verification failed:', errorData)
      return { success: false, error: 'reCAPTCHA verification failed' }
    }

    const result = await response.json()

    // Check if the token is valid and the action matches
    const isValid = result.tokenProperties?.valid &&
                   result.tokenProperties?.action === 'WAITLIST_SUBMIT'

    const riskScore = result.riskAnalysis?.score || 0

    console.log('reCAPTCHA assessment:', {
      valid: isValid,
      score: riskScore,
      reasons: result.riskAnalysis?.reasons
    })

    // You can adjust the threshold (0.5 is recommended for form submissions)
    if (!isValid || riskScore < 0.5) {
      return {
        success: false,
        score: riskScore,
        error: 'Failed reCAPTCHA verification. Please try again.'
      }
    }

    return { success: true, score: riskScore }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return { success: false, error: 'reCAPTCHA verification error' }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Verify reCAPTCHA token
    if (!data.recaptchaToken) {
      return NextResponse.json(
        { error: 'reCAPTCHA token missing', message: 'Please complete the reCAPTCHA verification.' },
        { status: 400 }
      )
    }

    const recaptchaResult = await verifyRecaptcha(data.recaptchaToken)

    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          error: 'reCAPTCHA verification failed',
          message: recaptchaResult.error || 'Failed security verification. Please try again.'
        },
        { status: 403 }
      )
    }

    // Remove the token from data before processing
    const { recaptchaToken, ...cleanData } = data

    // Send confirmation email to the user
    await resend.emails.send({
      from: 'w3Stream <onboarding@w3stream.com>',
      to: cleanData.email,
      subject: 'Welcome to the w3Stream Waitlist!',
      react: WaitlistConfirmationEmail({ name: cleanData.name }),
    })

    // You can also send a notification to your team
    // await resend.emails.send({
    //   from: 'w3Stream <notifications@w3stream.com>',
    //   to: 'team@w3stream.com',
    //   subject: 'New Waitlist Signup',
    //   react: NewSignupNotification(cleanData),
    // })

    console.log("[v0] Waitlist submission received:", {
      ...cleanData,
      recaptchaScore: recaptchaResult.score
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error processing waitlist submission:", error)
    return NextResponse.json(
      { error: "Failed to process submission", message: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
