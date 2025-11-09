'use client';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePageDataQuery } from '@/hooks/usePageDataQuery'
import { useRoomSettings } from '@/hooks/useRoomSettings'
import { Client } from '@/[...puckPath]/client'
import { AIPrompt } from '@/components/AIPrompt'
import { createClient } from '@/utils/supabaseClients/client'
import LivekitRoomWrapper from '@/providers/LivekitRoomWrapper'
import { useNicknames } from 'react-together'

interface ClientPageProps {
  roomId: string;
}

/* -------- Error Boundary for ReactTogether components -------- */
class ReactTogetherErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[ReactTogetherErrorBoundary] Context not available:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return null; // Don't render anything if context is missing
    }
    return this.props.children;
  }
}

/* -------- Nickname initializer component -------- */
function NicknameInitializerInner({ participantName }: { participantName: string }) {
  const [currentNickname, setNickname] = useNicknames()

  // Use useLayoutEffect to set nickname synchronously before paint
  // This ensures nickname is set before any child components render
  useLayoutEffect(() => {
    console.log("[NicknameInitializer] RUNNING - participantName:", participantName)
    console.log("[NicknameInitializer] Current nickname BEFORE setting:", currentNickname)

    if (participantName && participantName.trim()) {
      console.log("[NicknameInitializer] ✅ SETTING nickname to:", participantName.trim())
      setNickname(participantName.trim())

      // Verify it was set
      setTimeout(() => {
        console.log("[NicknameInitializer] Current nickname AFTER setting:", currentNickname)
      }, 100)
    } else {
      console.error("[NicknameInitializer] ❌ FAILED - participantName is empty or invalid:", participantName)
    }
  }, [participantName, setNickname, currentNickname])

  return null
}

function NicknameInitializer({ participantName }: { participantName: string }) {
  return (
    <ReactTogetherErrorBoundary>
      <NicknameInitializerInner participantName={participantName} />
    </ReactTogetherErrorBoundary>
  );
}

export function ClientPage({ roomId }: ClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: pageData, isLoading, error } = usePageDataQuery(roomId);
  const { data: roomSettings, isLoading: isLoadingSettings } = useRoomSettings(roomId);
  const [user, setUser] = useState<any>(null);
  const [promptCount, setPromptCount] = useState(0);
  const [updatedPageData, setUpdatedPageData] = useState<any>(null);

  // Extract participant name from URL params
  const participantName = searchParams.get('name') || 'User';

  console.log("[ClientPage] URL searchParams:", Object.fromEntries(searchParams.entries()))
  console.log("[ClientPage] Extracted participantName:", participantName)

  // Check if user has completed prejoin (should have name param at minimum)
  React.useEffect(() => {
    const name = searchParams.get('name');

    // If no name parameter, redirect to prejoin
    if (!name) {
      router.push(`/prejoin/${roomId}`);
    }
  }, [roomId, searchParams, router]);

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

    // Update all SVGEditor components in the page data with the new SVG URL
    if (pageData) {
      const updateSvgUrlInContent = (content: any[]): any[] => {
        return content.map(item => {
          // Check if this is an SVGEditor component
          if (item.type === 'SVGEditor') {
            console.log('Updating SVGEditor with new URL:', svgUrl);
            return {
              ...item,
              props: {
                ...item.props,
                svgUrl: svgUrl
              }
            };
          }

          // Recursively update nested content in slots
          if (item.slots) {
            const updatedSlots: any = {};
            Object.keys(item.slots).forEach(slotKey => {
              updatedSlots[slotKey] = updateSvgUrlInContent(item.slots[slotKey]);
            });
            return {
              ...item,
              slots: updatedSlots
            };
          }

          return item;
        });
      };

      const newPageData = {
        ...pageData,
        content: updateSvgUrlInContent(pageData.content || [])
      };

      console.log('Updated page data with new SVG URL:', newPageData);
      setUpdatedPageData(newPageData);
    }
  };

  // Use updated data if available, otherwise use original pageData
  const dataToRender = updatedPageData || pageData;

  // Render with LivekitRoomWrapper at this level to prevent duplicate connections
  // NicknameInitializer MUST be at same level as LivekitRoomWrapper to access ReactTogether context
  return (
    <>
      <NicknameInitializer participantName={participantName} />
      <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
        <Client data={dataToRender} />
        {roomSettings?.enable_ai_prompt && user && (
          <AIPrompt
            user={user}
            promptCount={promptCount}
            prompts={4}
            onSvgGenerated={handleSvgGenerated}
          />
        )}
      </LivekitRoomWrapper>
    </>
  );
}