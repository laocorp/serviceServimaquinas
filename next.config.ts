import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Permitir imágenes desde Vercel Blob (CDN público)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
