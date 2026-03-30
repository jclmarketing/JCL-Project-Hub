import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Parent folder also has package-lock.json; Turbopack would otherwise treat Claude/ as root.
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
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
