/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['node-llama-cpp', '@reflink/reflink'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('node-llama-cpp', '@reflink/reflink');
    }
    return config;
  },
};

export default nextConfig;
