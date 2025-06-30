import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import react from "@vitejs/plugin-react";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    workspace: [
      // Unit tests workspace
      {
        resolve: {
          alias: {
            "@": path.resolve(dirname, "./src"),
          },
        },
        test: {
          name: "unit",
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          environment: "jsdom",
          globals: true,
          retry: 1,
          setupFiles: [
            "@testing-library/jest-dom",
            resolve(__dirname, "test/setup.ts"),
          ],
          deps: {
            inline: ["@testing-library/jest-dom"],
          },
          pool: "forks", // This can help with module resolution
        },
      },
      // Storybook tests workspace
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
          react(),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            name: "chromium",
            provider: "playwright",
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});

/**
 * import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Add these for modern compatibility
    deps: {
      inline: ['@testing-library/jest-dom'],
    },
    pool: 'forks', // This can help with module resolution
  },
});
 */
