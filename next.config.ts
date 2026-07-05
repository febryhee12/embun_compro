import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Prefer AVIF over WebP for local static assets. NOTE: `unoptimized: true`
    // below disables Next.js's built-in on-demand image optimizer entirely,
    // since static export (`output: 'export'`) can't run a server to serve
    // optimized images on demand. `formats` is kept here to document intent
    // in case this project ever moves off static export to a Node.js/Vercel
    // server build, where the optimizer (and `formats`) would apply again.
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
};

export default nextConfig;
