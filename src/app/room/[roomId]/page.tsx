import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Metadata } from "next";

import { getQueryClient } from '@/get-query-client';
import { ClientPage } from './ClientPage';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Test Page',
  };
}


export default async function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const queryClient = getQueryClient()
  const { roomId } = await params;

  const initialSettings = {
    video: videoEnabled,
    audio: audioEnabled,
  }

  // Render different room components based on room type
  // Both wrapped with ReactTogether for shared state (needed for chat and cursors)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage roomId={roomId} />
    </HydrationBoundary>
  )
}