// app/[...puckPath]/ClientPage.tsx
'use client';

import React from 'react';
import { HydrationBoundary, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import type { DehydratedState } from '@tanstack/react-query';
import { Client } from './client';
import { getCookie } from 'cookies-next';
import { usePageDataQuery } from '@/hooks/usePageDataQuery';  
import LiquidOrbs from '@/components/LiquidOrbs';
interface ClientPageProps {
  dehydratedState?: DehydratedState;
  path: string;
}
 

function PageContent({ path }: { path: string }) {
  const asset_id = getCookie('asset_id') as string;
  const username = path.toLowerCase().replace('/user/', '');
  
  const { data, isLoading, error } = usePageDataQuery(username);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <LiquidOrbs />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;
  }

  return <Client data={data} path={path}  />;
}

export default function ClientPage({ dehydratedState, path }: ClientPageProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState as DehydratedState}>
        <PageContent path={path} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}  
 