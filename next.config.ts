import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // These import their own global CSS, which the pages router only allows for transpiled packages.
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  allowedDevOrigins: [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ],
  // Optional: In dev you can uncomment rewrites to avoid CORS.
  // If you use rewrites, set NEXT_PUBLIC_API_BASE_URL to http://localhost:8000.
  async rewrites() {
    const destRoot = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
    return [
      { source: '/api/:path*', destination: `${destRoot}/api/:path*` },
    ];
  },
};

// Service worker (installable app + offline fallback). The worker source is worker/sw.ts.
const withSerwist = withSerwistInit({
  swSrc: 'worker/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
  additionalPrecacheEntries: [{ url: '/offline.html', revision: '1' }],
});

export default withSerwist(nextConfig);
