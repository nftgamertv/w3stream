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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage roomId={roomId} />
    </HydrationBoundary>
  )
}