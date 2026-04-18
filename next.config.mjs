/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any HTTPS image URL in press releases (cover images pasted as URLs)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
