'use server';

import React from 'react';
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getQueryClient } from '../get-query-client';
import { dehydrate } from '@tanstack/react-query';
import ClientPage from './ClientPage';
import { fetchPageData } from '../actions/fetchPageData';

type Props = {
  params: Promise<{ puckPath?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;

  // Filter out Next.js static assets
  if (path.startsWith('/_next') || path.includes('.map') || path.match(/\.(css|js|json|ico|png|jpg|svg|woff|woff2)$/)) {
    return { title: 'Static Asset' };
  }

  const data: { root?: { props?: { title?: string } } } = await fetchPageData(path)
  console.log("Fetched Data for Metadata:", data);

  return {
    title: data?.root?.props?.title || 'Default Title',
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;

  // Filter out Next.js static assets - just return null silently
  if (path.startsWith('/_next') || path.includes('.map') || path.match(/\.(css|js|json|ico|png|jpg|svg|woff|woff2)$/)) {
    return null;
  }

  const queryClient = getQueryClient();
  const roomId = path.replace(/^\//, '');

  await queryClient.prefetchQuery({
    queryKey: [`pageData_${roomId}`],
    queryFn: async () => {
      const data = await fetchPageData(roomId);
      console.log("Fetched Page Data:", data);
      return data;
    },
  });

  const dehydratedState = dehydrate(queryClient);
  console.log("Dehydrated State:", dehydratedState);

  return <ClientPage dehydratedState={dehydratedState} path={path} />;
}