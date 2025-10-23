'use client'

 
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getQueryClient } from '@/get-query-client'
import { createClient } from "@/utils/supabaseClients/client"
import { userOptions } from "@/queries/users"
import LiquidOrbs from "@/components/LiquidOrbs"
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
           <LiquidOrbs />
        )
      }
  return (
    <div>
      
    </div>
  )
}
