'use client'
 
import { Drawer } from 'vaul';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { createClient } from '@/utils/supabaseClients/client';
import React, { useState, useEffect } from 'react' 
import Link from 'next/link';
export default  function SideDrawer() {
  const [user, setUser] =  useState<any>(null);
  const supabase = createClient();
useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
    }  
    fetchUser();    
}, []);
  return (
    <Drawer.Root direction="right">
      <Drawer.Trigger className="relative flex h-10  w-full items-center justify-end gap-2 my-4 overflow-hidden  px-4 text-sm font-medium shadow-sm transition-all">
<div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage src={user?.user_metadata?.avatar_url} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      </div>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 " />
        <Drawer.Content
          className="right-2 top-2 bottom-2 fixed z-10 outline-none w-[310px] flex"
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
        >
          <div className="bg-zinc-950 h-full w-full grow p-5 flex flex-col  ">
            <Drawer.Title className="mb-4 text-2xl font-bold text-white hidden">Menu</Drawer.Title>
            <div className="max-w-md mx-auto">
            <Link href="/dashboard" className="text-2xl font-bold text-white">Dashboard</Link>
    
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}