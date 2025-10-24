// fetchPageData.ts
'use server';
import { fetchRedirects } from './fetchRedirects';

const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://nftg-v7-8-4d143.vercel.app';

export const fetchPageData = async (name: string) => {
  const username = name?.toLowerCase().replace('/user/', '');
  const ipfsHash = await fetchRedirects(username);
  console.log(JSON.stringify(ipfsHash), 'ipfsHash');

  if (ipfsHash) {
    try {
      const response = await fetch(`${HOST}/api/pinata/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ CID: ipfsHash }),
        cache: 'no-store' // Explicitly avoid caching
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching page data:', error);
      throw error;
    }
  } else {
    return null;
  }
};