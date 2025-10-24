'use client'

import { useQuery } from '@tanstack/react-query';
import { fetchPageData } from '../actions/fetchPageData';
import type { Data } from '@measured/puck';

export function usePageDataQuery(username: string) {
  return useQuery<Data, Error>({
    queryKey: [`pageData_${username}`],
    queryFn: async () => {
      console.log('Fetching data for:', username);
      const data = await fetchPageData(username);
      console.log('Fetched data:', data);
      return data;
    },
    staleTime: Infinity,
    retry: false
  });
}