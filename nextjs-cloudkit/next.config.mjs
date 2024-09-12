/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only configure this for client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,  // Preserve existing fallbacks
        fs: false,  // Ignore 'fs' module in client-side builds
      };
    }

    return config;
  },
};

export default nextConfig;
