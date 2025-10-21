/**
 * Next.js Optimization Configuration
 *
 * This configuration enhances code splitting and lazy loading.
 * Merge these settings into your next.config.js file.
 */

const nextConfigOptimizations = {
  // Production optimization
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better code splitting
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,

    // Optimize package imports
    optimizePackageImports: [
      '@livekit/components-react',
      '@livekit/components-styles',
      '@react-three/fiber',
      '@react-three/drei',
      '@legendapp/state',
      'three',
    ],
  },

  // Webpack configuration for better code splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Three.js bundle
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              priority: 30,
              reuseExistingChunk: true,
            },
            // LiveKit bundle
            livekit: {
              test: /[\\/]node_modules[\\/](@livekit)[\\/]/,
              name: 'livekit',
              priority: 25,
              reuseExistingChunk: true,
            },
            // React libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/,
              name: 'react',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Other vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common code shared between pages
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
        },
        // Minimize module ids
        moduleIds: 'deterministic',
        // Runtime chunk
        runtimeChunk: 'single',
      };

      // Minimize bundle size
      config.optimization.minimize = true;

      // Analyze bundle (optional - enable when needed)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze.html',
            openAnalyzer: false,
          })
        );
      }
    }

    return config;
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfigOptimizations;

/**
 * Usage:
 *
 * 1. If you don't have a next.config.js:
 *    Copy this file and rename to next.config.js
 *
 * 2. If you have an existing next.config.js:
 *    Merge the relevant sections into your existing config
 *
 * 3. To analyze bundle:
 *    ANALYZE=true npm run build
 */
