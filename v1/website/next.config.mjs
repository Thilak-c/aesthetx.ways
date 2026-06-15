/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['geoip-lite'],
  images: {
    domains: ['localhost', 'aesthetxways.com', 'manage.aesthetxways.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  allowedDevOrigins: [
    '*.trycloudflare.com',
    'localhost',
    ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : [])
  ],
};

export default nextConfig;
