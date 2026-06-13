// Some packages (e.g. @repo/shared's crypto helpers, and anything using
// @repo/db's encryptedText columns) require ENCRYPTION_KEY at runtime.
// Set a deterministic 32-byte test key here so any test importing
// sharedConfig works without a real secret.
process.env.ENCRYPTION_KEY ??= Buffer.from(
  "test-encryption-key-32-bytes-ok!",
).toString("base64");

export const sharedConfig = {
  test: {
    globals: true,
    coverage: {
      provider: "istanbul" as const,
      reporter: [
        [
          "json",
          {
            file: `../coverage.json`,
          },
        ],
      ] as const,
      enabled: true,
    },
  },
};

// Re-export specific configs for backwards compatibility
export { baseConfig } from "./configs/base-config.js";
export { uiConfig } from "./configs/ui-config.js";
