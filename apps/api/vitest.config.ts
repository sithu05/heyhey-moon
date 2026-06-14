import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ...sharedConfig,
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    ...sharedConfig.test,
    // Package-specific overrides if needed
  },
});
