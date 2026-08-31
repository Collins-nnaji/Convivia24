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
      { source: '/trivia', destination: '/discover', permanent: true },
      { source: '/trivia/:path*', destination: '/discover/:path*', permanent: true },
      { source: '/plan', destination: '/party-planner', permanent: true },
      { source: '/plan/:path*', destination: '/party-planner/:path*', permanent: true },
      { source: '/card', destination: '/guest-card', permanent: true },
      { source: '/card/:path*', destination: '/guest-card/:path*', permanent: true },
      { source: '/refer', destination: '/refer-and-earn', permanent: true },
      { source: '/refer/portal', destination: '/your-referrals', permanent: true },
      { source: '/refer/:path*', destination: '/refer-and-earn/:path*', permanent: true },
      { source: '/account', destination: '/my-account', permanent: true },
      { source: '/account/:path*', destination: '/my-account/:path*', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/terms', destination: '/terms-of-use', permanent: true },
    ];
  },
};

module.exports = nextConfig;
