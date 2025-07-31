import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    domains: [
      "api.microlink.io",
    ],
  },
};

export default nextConfig;
