'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabaseClients/client";
import { usePageDataQuery } from '@/hooks/usePageDataQuery'
import { getCookie } from "cookies-next";
import {  Client } from  '../[...puckPath]/client'

// Local fallback Client component to avoid importing from a dynamic route path.
// Replace this with a real shared component import (e.g. import Client from '@/components/Client') when you have a proper component file.
 

export function ClientPage({ username }) {  // Fetch
  const actor = getCookie('actor') as string; 
 
  const { data:pageData, isLoading, error } = usePageDataQuery(username);


 
  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pageData || Object.keys(pageData).length === 0) return <div>No data found.</div>;

  // Render Client component with fetched data
  return <Client data={pageData} />;
}