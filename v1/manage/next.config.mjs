/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  allowedDevOrigins: ['soa-thumbs-qld-hopes.trycloudflare.com'],
};

export default nextConfig;
