/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  turbopack: {},
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  webpack: (config) => {
    config.parallelism = 1;
    return config;
  },
};

export default nextConfig;
