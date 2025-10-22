'use client'

 
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getQueryClient } from '@/get-query-client'
import { createClient } from "@/utils/supabaseClients/client"
import { userOptions } from "@/queries/users"
export default function Waitlist() {
     const router = useRouter()
      const [isCheckingAuth, setIsCheckingAuth] = useState(true)
      const [name, setName] = useState("")
      const [roomId, setRoomId] = useState("")
      const [isCreating, setIsCreating] = useState(false)
      const [isJoining, setIsJoining] = useState(false)
      const queryClient = getQueryClient()
      void queryClient.prefetchQuery(userOptions)
      useEffect(() => {
        const checkAuth = async () => {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            // User is not authenticated
            setIsCheckingAuth(false)
            router.push("/waitlist/login")
            return
          }
          setIsCheckingAuth(false)
           // Chekc for existing submissions 

           const { data, error } = await supabase 
            .from('w3s_waitlist')   
            .select('*')
            .eq('id', user.id)
            
            if (error) {
              console.error("Error checking waitlist submission:", error)
              return
            }
            if (data && data.length > 0) {
              // User has already submitted to the waitlist
              router.push("/waitlist/success")
              return
            } 

            if (!data || data.length === 0) {
              // User has not submitted to the waitlist
              setIsCheckingAuth(false)
               router.push("/waitlist/signup")
              return
            }
 
        }
    
        checkAuth()
      }, [router])
    
      if (isCheckingAuth) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-400">One moment...</p>
            </div>
          </div>
        )
      }
  return (
    <div>
      
    </div>
  )
}
