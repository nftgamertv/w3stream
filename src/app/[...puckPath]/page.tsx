'use server';

import React from 'react';
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getQueryClient } from '../get-query-client';
import { dehydrate } from '@tanstack/react-query';
import ClientPage from './ClientPage';
import { fetchPageData } from '../actions/fetchPageData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  const data: { root?: { props?: { title?: string } } } = await fetchPageData(path)
  console.log("Fetched Data for Metadata:", data);

  return {
    title: data?.root?.props?.title || 'Default Title',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath = [] } = await params;
  const queryClient = getQueryClient();
  const path = `/${puckPath.join("/")}`;
  const username = path.toLowerCase().replace('/user/', '');

  await queryClient.prefetchQuery({
    queryKey: [`pageData_${username}`],
    queryFn: async () => {
      const data = await fetchPageData(path);
      console.log("Fetched Page Data:", data);
      return data;
    },
  });

  const dehydratedState = dehydrate(queryClient);
  console.log("Dehydrated State:", dehydratedState);

  return <ClientPage dehydratedState={dehydratedState} path={path} />;
}