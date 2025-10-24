'use client';

import React from 'react';
import { HydrationBoundary, QueryClientProvider, QueryClient, type DehydratedState } from '@tanstack/react-query';
import { Client } from './client';
import { usePageDataQuery } from '@/hooks/usePageDataQuery';

interface ClientPageProps {
  dehydratedState: DehydratedState;
  path: string;
}

function PageContent({ path }: { path: string }) {
  const username = path.toLowerCase().replace('/user/', '');
  const { data, isLoading, error } = usePageDataQuery(username);

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-screen h-screen flex items-center justify-center">Error loading page: {error.message}</div>;
  }

  if (!data) {
    return <div className="w-screen h-screen flex items-center justify-center">No data found</div>;
  }

  return <Client data={data} />;
}

export default function ClientPage({ dehydratedState, path }: ClientPageProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <PageContent path={path} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}


  