'use server'

import { createClient } from '@/utils/supabaseClients/server'

export async function getRandomSvg(): Promise<{ success: boolean; svgUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // List all files in the generated folder
    const { data: files, error: listError } = await supabase
      .storage
      .from('svgs')
      .list('generated', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (listError) {
      throw listError
    }

    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'No SVGs found in bucket'
      }
    }

    // Pick a random file
    const randomFile = files[Math.floor(Math.random() * files.length)]

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('svgs')
      .getPublicUrl(`generated/${randomFile.name}`)

    return {
      success: true,
      svgUrl: publicUrl
    }

  } catch (error) {
    console.error('Error fetching random SVG:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
