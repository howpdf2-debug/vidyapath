const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NODE_ENV === 'development'

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  // ✅ FIX: Dev me SW register NAHI hoga — sirf production me
  register: !isDev,
  // ✅ FIX: Dev me PWA fully disabled
  disable: isDev,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    // ✅ Skip waiting for old service workers to prevent stale chunks
    skipWaiting: true,
    clientsClaim: true,
    // ✅ Clean old caches automatically
    cleanupOutdatedCaches: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Production optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // ✅ Remove console logs in production (keep errors/warnings)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // ✅ Optimize large package imports (tree-shaking)
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast', 'date-fns'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // ✅ Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // ✅ FIX: Dev me sw.js cache na ho — always fresh
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

// ✅ Wrap order: bundle analyzer OUTSIDE, PWA INSIDE
module.exports = withBundleAnalyzer(withPWA(nextConfig))