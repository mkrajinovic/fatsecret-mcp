import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    testTimeout: 30000,
    setupFiles: ["dotenv/config"],
    // Run integration tests sequentially to avoid rate limiting
    sequence: {
      concurrent: false,
    },
    // Disable file parallelism for integration tests
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**"],
    },
  },
});
