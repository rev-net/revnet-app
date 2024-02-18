/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.stamp.fyi",
        port: "",
        pathname: "/avatar/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_INFURA_IPFS_HOSTNAME,
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};
