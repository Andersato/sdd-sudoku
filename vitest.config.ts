import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // palette.test.ts lee styles.css con ?raw; sin esto Vitest lo sustituye por "".
    css: { include: [/styles\.css/] },
  },
});
