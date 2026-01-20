/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/page/1',
        destination: '/',
        permanent: true, // 308 redirect for SEO
      },
    ];
  },
};

export default nextConfig;
