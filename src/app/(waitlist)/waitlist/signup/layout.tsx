import React from 'react'
import Navbar from '@/components/Navbar'
import { SidebarProvider, SidebarInset  } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Nav } from 'react-day-picker'
export default function WaitlistLayout({ children }: { children: React.ReactNode } ) {
  return (
    <div>
        {children }
    </div>
  )
}
