import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { Metadata } from "next";

import { getQueryClient } from '@/get-query-client';
import { ClientPage } from './ClientPage';
import { fetchPageData } from '@/actions/fetchPageData';
import { getCookie } from 'cookies-next';

export async function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Promise<Metadata> {
  const data = await fetchPageData(username?.toLowerCase());
  return {
    title: data?.root?.props?.title || 'Page Not Found',
  };
}
 
 
export default async function Page({
  params: { username },
}: {
  params: { username: string };
}) {
 
  const queryClient = getQueryClient()
 


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage username={username} />
    </HydrationBoundary>
  )
}