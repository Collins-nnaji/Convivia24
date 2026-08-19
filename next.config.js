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
  async redirects() {
    return [
      { source: '/companion', destination: '/', permanent: true },
      { source: '/companion/:path*', destination: '/', permanent: true },
      { source: '/crews', destination: '/', permanent: true },
      { source: '/crews/:path*', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
