'use client'

import React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {SidebarTrigger}  from "@/components/ui/sidebar"
import { userOptions } from '@/queries/users'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/utils/supabaseClients/client'
import { useRouter } from 'next/navigation'

export const Navbar = () => {
  const { data: user } = useSuspenseQuery(userOptions)
  const router = useRouter()
  console.log(user, "navbar user")

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-full">
            <header className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <div>
                   
  
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="relative px-6 py-2 bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-full hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300">
                            <Avatar className="inline-block w-8 h-8 rounded-full overflow-hidden align-middle mr-2">
                              <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                              <AvatarFallback>{user?.user_metadata?.full_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-white font-medium">{user?.user_metadata?.full_name || 'User'}</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
                          <DropdownMenuLabel className="text-slate-200">
                            My Account
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-slate-100">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-800" />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-400 focus:bg-slate-800 focus:text-red-300 cursor-pointer"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </header> 
    </div>
  );
};

export default Navbar;