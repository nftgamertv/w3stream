"use server"

import { createClient as getSupabaseServerClient } from "@/utils/supabaseClients/server"
import { Resend } from "resend"
import WaitlistConfirmationEmail from "@/emails/waitlist-confirmation"
const resend = new Resend(process.env.RESEND_API_KEY)

export type WaitlistFormData = {
  name: string;
  email: string;
  isInfluencer: boolean;
  influencerHandle: string;
  influencerPlatform: string;
  bio: string;
  socialHandles: Record<string, string>;
 
}
export async function submitWaitlistForm(formData: WaitlistFormData) {
 

    const supabase = await getSupabaseServerClient()

    // Prepare data for database
    const dbData = {
      name: formData.name,
      email: formData.email,
      category: formData.isInfluencer ? "streamer/gamer/influencer/KOL" : "general",
      role: formData.influencerHandle || null,
      currentPlatform: formData.influencerPlatform || null,
      primaryUseCase: formData.bio,
      mustHaveFeatures: Object.keys(formData.socialHandles).length > 0 ? JSON.stringify(formData.socialHandles) : null,
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("w3s_waitlist").insert([dbData]).select()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return { success: false, error: "Failed to save your information. Please try again." }
    }

    // Send confirmation email via Resend
    try {
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: formData.email,
        subject: "Welcome to Our Private Beta Waitlist!",
        react: WaitlistConfirmationEmail({ name: formData.name }),
      })

      if (emailResult.error) {
        console.error("[Waitlist] Resend API error:", {
          error: emailResult.error,
          email: formData.email,
          name: formData.name,
        })
      } else {
        console.log("[Waitlist] Email sent successfully:", {
          id: emailResult.data?.id,
          to: formData.email,
        })
      }
    } catch (emailError) {
      console.error("[Waitlist] Resend exception:", {
        error: emailError instanceof Error ? emailError.message : emailError,
        stack: emailError instanceof Error ? emailError.stack : undefined,
        email: formData.email,
      })
      // Don't fail the whole operation if email fails
    }

    return { success: true, data }
  }  
 
