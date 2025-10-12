'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabaseClients/client'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')
  const supabase = createClient()
  const user = supabase.auth.getUser()



  return (
    <div>
      <h1>Authentication Error</h1>
      <p>Error: {error}</p>
      {description && <p>Description: {description}</p>}
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}