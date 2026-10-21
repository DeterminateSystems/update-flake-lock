import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [".jj/**/*", ".direnv/**/*", "node_modules/**/*"],
  },
});
