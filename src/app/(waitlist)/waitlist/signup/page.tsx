import { WaitlistForm } from '@/components/WaitlistForm'
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabaseClients/client"
import { userOptions } from "@/queries/users"
import { getQueryClient } from '@/get-query-client'

export default function WaitlistSignup() {
      const router = useRouter()
      const [isCheckingAuth, setIsCheckingAuth] = useState(true) 
      const queryClient = getQueryClient()
      void queryClient.prefetchQuery(userOptions)
      useEffect(() => {
        const checkAuth = async () => {
          const supabase = createClient()
    
          // Check if user is logged in
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          console.log("user", user, userError)
          if (!user || userError) {
            router.push("/waitlist/login")
            return
          }
     // User is authorized
          setIsCheckingAuth(false)
        }
    
        checkAuth()
      }, [router])
    
      if (isCheckingAuth) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-400">Checking access...</p>
            </div>
          </div>
        )
      }
  return (
    <div>
      <WaitlistForm   />
    </div>
  )
}
