import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/schema/index.ts"],
  format: "esm",
  dts: false,
  clean: true,
  fixedExtension: false,
});
