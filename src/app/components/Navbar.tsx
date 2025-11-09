'use client'

import React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
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
import { cn } from '@/lib/utils'

interface NavbarProps {
  leftContent?: React.ReactNode
  centerContent?: React.ReactNode
  rightContent?: React.ReactNode
  showUserMenu?: boolean
  className?: string
}

// const UserMenu = () => {
//   const { data: user } = useSuspenseQuery(userOptions)
//   const router = useRouter()

//   const handleLogout = async () => {
//     const supabase = createClient()
//     await supabase.auth.signOut()
//     router.push('/')
//   }

//   return (
//     <div className="relative">
//       <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl" />
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <button className="relative flex items-center gap-3 rounded-full border border-cyan-500/30 bg-linear-to-r from-cyan-500/10 to-purple-500/10 px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-cyan-500/20 hover:to-purple-500/20">
//             <Avatar className="inline-block h-8 w-8 overflow-hidden rounded-full">
//               <AvatarImage src={user?.user_metadata?.avatar_url} alt="User Avatar" className="h-full w-full object-cover" />
//               <AvatarFallback>{user?.user_metadata?.full_name?.[0] || 'U'}</AvatarFallback>
//             </Avatar>
//             <span className="truncate">{user?.user_metadata?.full_name || 'User'}</span>
//           </button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-56 border-slate-800 bg-slate-900">
//           <DropdownMenuLabel className="text-slate-200">My Account</DropdownMenuLabel>
//           <DropdownMenuSeparator className="bg-slate-800" />
//           <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-slate-100">
//             <User className="mr-2 h-4 w-4" />
//             <span>Profile</span>
//           </DropdownMenuItem>
//           <DropdownMenuSeparator className="bg-slate-800" />
//           <DropdownMenuItem
//             onClick={handleLogout}
//             className="cursor-pointer text-red-400 focus:bg-slate-800 focus:text-red-300"
//           >
//             <LogOut className="mr-2 h-4 w-4" />
//             <span>Log out</span>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   )
// }

export const Navbar = ({
  leftContent,
  centerContent,
  rightContent,
  showUserMenu = true,
  className,
}: NavbarProps = {}) => {
  return (
    <header
      className={cn(
        'relative z-40 grid min-h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-white/10 bg-black/30 px-6 py-4 text-white shadow-lg backdrop-blur-xl',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {leftContent}
      </div>
      <div className="flex items-center justify-center">
        {centerContent}
      </div>
      <div className="ml-auto flex items-center justify-end gap-4">
        {rightContent}
        {/* {showUserMenu && <UserMenu />} */}
      </div>
    </header>
  )
}

export default Navbar