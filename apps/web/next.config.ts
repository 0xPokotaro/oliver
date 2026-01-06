import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@oliver/database",
    "@oliver/shared",
    "@oliver/api",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.oliver.dev',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      "@oliver/api": "../api/src/index.ts",
      "@oliver/api/*": "../api/src/*",
      "@oliver/database": "../packages/database",
      "@oliver/shared": "../packages/shared",
    },
    resolveExtensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
        "@prisma/client-runtime-utils": "commonjs @prisma/client-runtime-utils",
        "@oliver/database": "commonjs @oliver/database",
        "@oliver/shared": "commonjs @oliver/shared",
      });
    }
    return config;
  },
};

export default nextConfig;
