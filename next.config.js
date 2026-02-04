/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  output: 'standalone',
};

module.exports = nextConfig;
