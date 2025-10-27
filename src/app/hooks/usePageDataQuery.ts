'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchPageData } from '../actions/fetchPageData';
import type { Data } from '@measured/puck';

export function usePageDataQuery(roomId: string) {
  return useQuery<Data, Error>({
    queryKey: [`pageData_${roomId}`],
    queryFn: async () => {
      console.log('Fetching data for roomId:', roomId);
      const data = await fetchPageData(roomId);
      console.log('Fetched data:', data);
      return data;
    },
    staleTime: 0, // Always refetch to get latest data
    retry: false
  });
}