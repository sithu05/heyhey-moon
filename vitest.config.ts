import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, mergeConfig } from "vitest/config";
import { sharedConfig, uiConfig } from "@repo/vitest-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  ...sharedConfig,
  test: {
    projects: [
      {
        root: "./packages",
        test: {
          ...sharedConfig.test,
          // Project-specific configuration for packages
          // ...
        },
      },
      mergeConfig(uiConfig, {
        root: "./apps/admin-portal",
        resolve: {
          alias: {
            "@": path.resolve(dirname, "./apps/admin-portal/src"),
          },
        },
        test: {
          ...sharedConfig.test,
        },
      }),
      {
        root: "./apps/api",
        resolve: {
          alias: {
            "@": path.resolve(dirname, "./apps/api/src"),
          },
        },
        test: {
          ...sharedConfig.test,
        },
      },
    ],
  },
});
