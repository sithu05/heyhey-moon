import { mergeConfig } from "vitest/config";
import { uiConfig } from "@repo/vitest-config/ui";

export default mergeConfig(uiConfig, {
  test: {
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
