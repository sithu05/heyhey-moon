import { mergeConfig } from "vitest/config";

import { uiConfig } from "@repo/vitest-config/ui";

export default mergeConfig(uiConfig, {
  test: {
    setupFiles: ["./src/test-setup.ts"],
  },
});
