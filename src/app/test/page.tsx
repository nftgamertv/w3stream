import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Metadata } from "next";

import { getQueryClient } from '@/get-query-client';
import { ClientPage } from './ClientPage';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Test Page',
  };
}


export default async function Page() {
  const queryClient = getQueryClient()

  // Use a test username for this static test page
  const testUsername = 'test';

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage username={testUsername} />
    </HydrationBoundary>
  )
}