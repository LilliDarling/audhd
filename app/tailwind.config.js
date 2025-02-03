const { createThemes } = require("tw-colors");
const twColors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    './node_modules/@rnr/**/*.{ts,tsx}',
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {}
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("nativewind/dist/tailwind/safe-area").safeArea,
    createThemes(
      {
        light: {
          dull: {
            primary: twColors.slate["100"],
            secondary: twColors.slate["500"],
          },
          pop: {
            primary: twColors.emerald["500"],
            secondary: twColors.rose["500"]
          }
        },
        dark: {
          dull: {
            primary: twColors.zinc["800"],
            secondary: twColors.slate["400"],
          },
          pop: {
            primary: twColors.pink["600"],
            secondary: twColors.emerald["500"]
          }
        },
      },
      { defaultTheme: "light" },
    ),
  ],
};
