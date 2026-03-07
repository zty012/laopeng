/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/sso/:path*",
        destination: "https://sso.bestsch.com/api/:path*",
      },
      {
        source: "/api/bsch-login/:path*",
        destination: "https://base.bestsch.com/BschLogin/api/:path*",
      },
      {
        source: "/api/bsch-authapi/:path*",
        destination: "https://base.bestsch.com/BschLogin/authapi/:path*",
      },
    ];
  },
};

export default nextConfig;
