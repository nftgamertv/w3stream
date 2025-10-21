'use client'

import { WaitlistForm } from '@/components/WaitlistForm'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabaseClients/client'
import { userOptions } from '@/queries/users'
import { getQueryClient } from '@/get-query-client'

export default function WaitlistSignup() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(userOptions)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('user', user, error)

      if (!user || error) {
        router.push('/waitlist/login')
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen   text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Checking access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Optional bloom overlay */}
      <div className="bloom-overlay" />
      <WaitlistForm />
    </div>
  )
}
