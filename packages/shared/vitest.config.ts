import { defineConfig } from "vitest/config";

import { sharedConfig } from "@repo/vitest-config";

// Tests need a valid 32-byte key but don't need a real secret.
process.env.ENCRYPTION_KEY ??= Buffer.from(
  "test-encryption-key-32-bytes-ok!",
).toString("base64");

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
  },
});
