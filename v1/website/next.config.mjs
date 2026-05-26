/** @type {import('next').NextConfig} */
const nextConfig = {
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
    'companies-amount-telling-sold.trycloudflare.com',
    ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : [])
  ],
};

export default nextConfig;
