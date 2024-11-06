/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: process.env.AWS_NEW_BUCKET_DOMAIN || 'new-bucket.com',
        },
        {
          protocol: "https",
          hostname: process.env.AWS_BUCKET_DOMAIN || 'bucket.com',
        },
      ],
      // domains: [
      //   ...(process.env.AWS_BUCKET_DOMAIN ? [process.env.AWS_BUCKET_DOMAIN] : []),
      //   ...(process.env.AWS_NEW_BUCKET_DOMAIN
      //     ? [process.env.AWS_NEW_BUCKET_DOMAIN]
      //     : []),
      // ],
    },
    async redirects() {
      return [
        {
          source: "/",
          destination: "/login",
          permanent: false,
        },
        {
          source: "/admin",
          destination: "/admin/login",
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  