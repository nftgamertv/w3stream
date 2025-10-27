'use client';

import React from 'react';
import { HydrationBoundary, QueryClientProvider, QueryClient, type DehydratedState } from '@tanstack/react-query';
import { Client } from './client';
import { usePageDataQuery } from '@/hooks/usePageDataQuery';
import { ClientReactTogetherWrapper } from '@/providers/ClientReactTogetherWrapper';
import LivekitRoomWrapper from '@/providers/LivekitRoomWrapper';

interface ClientPageProps {
  dehydratedState: DehydratedState;
  path: string;
}

function PageContent({ path }: { path: string }) {
  const roomId = path.replace(/^\//, '') || 'default-room';
  const { data, isLoading, error } = usePageDataQuery(roomId);

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-screen h-screen flex items-center justify-center text-red-500">Error loading page: {error.message}</div>;
  }

  if (!data) {
    return <div className="w-screen h-screen flex items-center justify-center">No data found for room: {roomId}</div>;
  }

  console.log('PageContent rendering with data:', data);

  // Render Client (Puck Render component) directly without additional wrappers
  // The LiveKit context is provided by LivekitRoomWrapper above
  return <Client data={data} />;
}

export default function ClientPage({ dehydratedState, path }: ClientPageProps) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnMount: true,
      },
    },
  }));

  const roomId = path.replace(/^\//, '') || 'default-room';
  const participantName = 'Viewer';

  // Critical: The provider order ensures LiveKit context is available when Puck renders components
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <LivekitRoomWrapper roomId={roomId} participantName={participantName}>
          <ClientReactTogetherWrapper>
            <PageContent path={path} />
          </ClientReactTogetherWrapper>
        </LivekitRoomWrapper>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}