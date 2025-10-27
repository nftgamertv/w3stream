'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabaseClients/server'

export async function uploadSVGToSupabase(svgUrl: string): Promise<string> {
    try {
        const cookieStore = cookies()
        
        const supabase = await createClient()

        const response = await fetch(svgUrl)
        if (!response.ok) {
            throw new Error(`Failed to download SVG: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')?.toLowerCase()
        if (!contentType?.includes('svg') && !contentType?.includes('xml')) {
            throw new Error(`Unexpected content type: ${contentType}`)
        }

        const svgContent = await response.text()
        if (!svgContent.includes('<svg')) {
            throw new Error('Content does not appear to be SVG')
        }

        const timestamp = Date.now()
        const filename = `svg_${timestamp}.svg`

        const blob = new Blob([svgContent], { type: 'image/svg+xml' })

        const { data, error } = await supabase
            .storage
            .from('svgs')
            .upload(`generated/${filename}`, blob, {
                contentType: 'image/svg+xml',
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            throw error
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('svgs/generated')
            .getPublicUrl(`${filename}`)

        return publicUrl

    } catch (error) {
        console.error('Error uploading to Supabase:', error)
        throw error
    }
}