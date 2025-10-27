'use server'

import { uploadSVGToSupabase } from "./uploadSVGToSupabase"
import { createClient } from "@/utils/supabaseClients/server"

export type GenerateResponse = {
  success: boolean
  data?: {
    svg: string
  }
  error?: string
}

export async function generateSvg(
  formData: FormData,  
  userId: string
): Promise<GenerateResponse> {
  const supabase = await createClient()
  
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }
  
  // Ensure user exists in dgen_users table
  const { error: userError } = await supabase
    .from('dgen_users')
    .upsert({
      id: user.id,
      email: user.email,
      raw_user_meta_data: user.user_metadata || {}
    }, {
      onConflict: 'id'
    })
  
  if (userError) {
    console.error('Error creating/updating user:', userError)
    throw new Error('Failed to create user record')
  }
  
  console.log(process.env.REPLICATE_API_KEY, 'process.env.REPLICATE_API_KEY')
  try {
 
   const prompt = formData.get('prompt')
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // Check if API key exists
    if (!process.env.REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not configured')
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(
      "https://api.replicate.com/v1/models/recraft-ai/recraft-20b-svg/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REPLICATE_API_KEY}`,
          "Prefer": "wait",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            size: "1024x1024",
            style: "vector_illustration/cartoon"
          }
        }),
        signal: controller.signal
      }
    ).catch(fetchError => {
      clearTimeout(timeoutId)
      console.error('Fetch error details:', fetchError)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - Replicate API took too long to respond')
      }
      throw new Error(`Network error: ${fetchError.message}`)
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('API Response Error:', response.status)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Replicate Response:', data)

    if (data) {


      // Save prediction with   and round info
      const { data: predictionData, error: predictionError } = await supabase
        .from('dgen_predictions')
        .insert({
          model: data.model,
          version: data.version,
          input_prompt: prompt,
          status: data.status,
          output: data.output,
          user_id: user.id,  // Use the authenticated user's ID

        })
        .select()
        .single()

      if (predictionError) {
        console.error('Supabase Insert Error:', predictionError)
        throw predictionError
      }

      console.log('Prediction Saved:', predictionData)

      if (!data.output) {
        throw new Error('No SVG output received from Replicate API')
      }

      const svgCode = await uploadSVGToSupabase(data.output)
      console.log('SVG Upload Result:', svgCode)

      const match = svgCode.match(/generated.*$/)
      if (!match) {
        throw new Error('Invalid SVG path format')
      }
 
      return {
        success: true,
        data: { svg: match[0] }
      }
    }

    throw new Error('No prediction ID returned')

  } catch (error) {
    console.error('Generate Image Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}