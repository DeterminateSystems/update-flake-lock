import config from "@determinate-systems/oxlint-config/typed";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [config],

  ignorePatterns: ["dist/**/*"],
});
