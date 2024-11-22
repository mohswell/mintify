/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: process.env.AWS_BUCKET_DOMAIN || 'bucket.com',
  //     },
  //   ],
  // },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
