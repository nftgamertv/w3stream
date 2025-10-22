import type { Metadata } from "next";
import type React from "react";

import { Geist, Geist_Mono } from "next/font/google";
import "@livekit/components-styles";
import "./globals.css";

import { Suspense } from "react";
import ReactQueryProvider from "./providers/ReactQueryProvider";

import {
  LazyThreeBackground,
  LazyVideoBackground,
  LazyLoginModalWrapper,
} from "./components/LazyComponents";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const embedData = {
  site_name: 'www.dopeoplestill/type-www-in-urls/?',
  author: 'you can add some additional info thats not the author here too',
  title: 'Some title I would try to keep to 40 characters or less',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam et justo justo. Pellentesque dignissim eros sed nisl mollis, eget iaculis urna tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut diam risus. Duis condimentum fermentum elementum. Aliquam varius arcu sit amet ligula auctor, in iaculis tortor feugiat. Vivamus luctus est in dolor accumsan congue.',
  image_url: '/images/oembed.png',
  theme_color: '#0090ff',
  og_type: 'website',
};

export const metadata: Metadata = {
  title: embedData.title,
  description: embedData.description,
  openGraph: {
    type: embedData.og_type as "website",
    siteName: embedData.site_name,
    title: embedData.title,
    description: embedData.description,
    images: [
      {
        url: embedData.image_url,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: embedData.title,
    description: embedData.description,
    images: [embedData.image_url],
  },
  other: {
    'og:author': embedData.author,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta property="og:image" content={`/images/oembed.png`} key="image" />
          <meta name="theme-color" content={'cyan'} key="theme-color" />
          <meta name="twitter:card" content="summary_large_image" key="misc-card" />
          <link
            type="application/json+oembed"
            href="/oEmbed.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ReactQueryProvider>
            {/* Lazy-loaded background components - render after initial page load */}
            <LazyThreeBackground />
            <LazyVideoBackground />
            {children}
          </ReactQueryProvider>
        </Suspense>

        {/* Lazy-loaded modal wrapper - only loads when needed */}
        <LazyLoginModalWrapper />

      </body>
    </html>
  );
}
