/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'aesthetxways.com', 'insys.aesthetxways.com', 'manage.aesthetxways.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
