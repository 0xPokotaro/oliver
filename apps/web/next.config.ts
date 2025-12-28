import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/client-runtime-utils',
    '@oliver/database',
  ],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      '@oliver/api': '../api/src/index.ts',
      '@oliver/api/*': '../api/src/*',
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        '@prisma/client-runtime-utils': 'commonjs @prisma/client-runtime-utils',
        '@oliver/database': 'commonjs @oliver/database',
      });
    }
    return config;
  },
};

export default nextConfig;
