/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly pass AUTH_SECRET so it is inlined at build time and available
  // in Edge Runtime (middleware). Without this, the middleware may fall back to
  // a different default secret than the one used by API routes at runtime,
  // causing ERR_JWS_SIGNATURE_VERIFICATION_FAILED.
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['bcryptjs', '@prisma/client', 'prisma'],
  },
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'unsplash.com' },
      { hostname: 'plus.unsplash.com' },
      // OpenAI DALL-E generated image CDN
      { hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      { hostname: 'dalleprodsec.blob.core.windows.net' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
