import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "test-key",
    },
  },
  resolve: {
    alias: {
      "@oliver/api": path.resolve(__dirname, "./src"),
      "@oliver/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@oliver/database": path.resolve(__dirname, "../../packages/database"),
    },
  },
});
