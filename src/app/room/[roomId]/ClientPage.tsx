'use client';
import React, { useState } from 'react';
import { usePageDataQuery } from '@/hooks/usePageDataQuery'
import { useRoomSettings } from '@/hooks/useRoomSettings'
import { Client } from '@/[...puckPath]/client'
import { AIPrompt } from '@/components/AIPrompt'
import { createClient } from '@/utils/supabaseClients/client'

interface ClientPageProps {
  roomId: string;
}

export function ClientPage({ roomId }: ClientPageProps) {
  const { data: pageData, isLoading, error } = usePageDataQuery(roomId);
  const { data: roomSettings, isLoading: isLoadingSettings } = useRoomSettings(roomId);
  const [user, setUser] = useState<any>(null);
  const [promptCount, setPromptCount] = useState(0);

  // Fetch user data when component mounts
  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch user's prompt count if user exists
      if (user) {
        const { count } = await supabase
          .from('generated_prompts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setPromptCount(count || 0);
      }
    };

    fetchUser();
  }, []);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading page data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading page</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">No page data found for room: {roomId}</p>
          <p className="text-xs text-muted-foreground mt-2">Create a page in the Puck editor first</p>
        </div>
      </div>
    );
  }

  console.log('ClientPage rendering with data:', pageData);
  console.log('Room settings:', roomSettings);

  // Callback to handle SVG generation
  const handleSvgGenerated = (svgUrl: string) => {
    console.log('SVG generated:', svgUrl);
    // You can add additional logic here to update the page or state
  };

  // Render Client component with fetched data and AIPrompt if enabled
  return (
    <>
      <Client data={pageData} />
      {roomSettings?.enable_ai_prompt && user && (
        <AIPrompt
          user={user}
          promptCount={promptCount}
          prompts={4}
          onSvgGenerated={handleSvgGenerated}
        />
      )}
    </>
  );
}