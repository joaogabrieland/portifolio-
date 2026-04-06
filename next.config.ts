import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  env: {
    ASAAS_API_KEY: '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmNlN2MzZGVlLTlkOWItNDk2ZC05NWM1LTA5NGRiZThkYWQ3ZTo6JGFhY2hfYjgyYWI2YzAtMmM1NS00NTU5LTk4ZmYtNmM3YjcxN2VjZThk',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;
