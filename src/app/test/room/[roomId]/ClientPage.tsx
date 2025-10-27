'use client';
import React from 'react';
import { usePageDataQuery } from '@/hooks/usePageDataQuery'
import { Client } from '@/[...puckPath]/client'

interface ClientPageProps {
  roomId: string;
}

export function ClientPage({ roomId }: ClientPageProps) {
  const { data: pageData, isLoading, error } = usePageDataQuery(roomId);

  // Handle loading and error states
  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  }

  if (!pageData) {
    return <div className="p-8">No data found for roomId: {roomId}</div>;
  }

  console.log('ClientPage rendering with data:', pageData);

  // Render Client component with fetched data
  return <Client data={pageData} />;
}