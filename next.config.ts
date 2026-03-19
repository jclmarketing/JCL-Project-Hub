import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        // Serve index.html for project root paths (home links)
        {
          source: "/projects/:slug",
          destination: "/projects/:slug/index.html",
        },
        // Serve .html files for extensionless sub-paths
        {
          source: "/projects/:slug/:path+",
          destination: "/projects/:slug/:path+.html",
        },
      ],
    };
  },
};

export default nextConfig;
