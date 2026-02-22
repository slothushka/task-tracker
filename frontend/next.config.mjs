/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow fetching from backend in server components
  async rewrites() {
    return [];
  },
};

export default nextConfig;
