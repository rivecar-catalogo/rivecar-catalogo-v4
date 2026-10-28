import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modelo clásico de render: más simple para un prototipo.
  cacheComponents: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
