import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },{
        protocol: 'https',
        hostname: 'mlowivmafxhewtmhohrd.supabase.co',
      },{
        protocol: 'https',
        hostname: 'vgwzhgureposlvnxoiaj.supabase.co',
      },{
      protocol: 'https',
      hostname: '*.supabase.co',
    },{
      protocol: 'https',
      hostname: 'static-cdn.jtvnw.net',
    },{
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
    },{
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },{
      protocol: 'https',
      hostname: 'cdn.pixabay.com',
    },{
      protocol: 'https',
      hostname: 'i.imgur.com',
    },{
      protocol: 'https',
      hostname: 'media.discordapp.net',
    },{
      protocol: 'https',
      hostname: 'cdn.shopify.com',
    },{
      protocol: 'https',
      hostname: 'www.gravatar.com',
    },{
      protocol: 'https',
      hostname: '*.cloudfront.net',
    },{
      protocol: 'https',
      hostname: '*.cloudinary.com',
    },{
      protocol: 'https',
      hostname: '*.flickr.com',
    },
    ]},
};

export default nextConfig;
