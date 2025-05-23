import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      values: [
        // 👇 Default values
        { name: "Dark", value: "#2a2c42" },
        { name: "Light", value: "#F7F9F2" },
      ],
      // 👇 Specify which background is shown by default
      default: "Dark",
    },
  },
};

export default preview;
