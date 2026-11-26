import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache';

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

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  runtimeCaching: [
    ...runtimeCaching,
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/api'),
      handler: 'NetworkFirst',
      method: 'GET', // ✅ Do NOT cache non-GET
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
})(nextConfig);