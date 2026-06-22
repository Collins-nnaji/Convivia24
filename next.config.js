/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure images work properly
  images: {
    unoptimized: true, // For Netlify compatibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

