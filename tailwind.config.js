// tailwind.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      screens: {
        xs: "390px",
        ...defaultTheme.screens,
        "2xl": "1400px",
      },
    },
  },
};
