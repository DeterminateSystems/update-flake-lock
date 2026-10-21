import { defineConfig } from "tsup";

import { name } from "./package.json";

export default defineConfig({
  name,
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node24",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: true,
  },
});
