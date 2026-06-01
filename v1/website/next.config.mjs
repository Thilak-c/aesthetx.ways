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
    'samuel-adoption-theta-boston.trycloudflare.com','companies-amount-telling-sold.trycloudflare.com', 'dream-serial-engaged-engines.trycloudflare.com', "momentum-isolation-focus-diane.trycloudflare.com",
    ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : [])
  ],
};

export default nextConfig;
