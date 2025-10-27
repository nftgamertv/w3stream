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
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading page data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading page</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">No page data found for room: {roomId}</p>
          <p className="text-xs text-muted-foreground mt-2">Create a page in the Puck editor first</p>
        </div>
      </div>
    );
  }

  console.log('ClientPage rendering with data:', pageData);

  // Render Client component with fetched data
  return <Client data={pageData} />;
}