// tailwind.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      screens: {
        xxs: "100px",
        xs: "390px",
        ...defaultTheme.screens,
        "2xl": "1280px",
        "3xl": "1400px",
      },
    },
  },
};
