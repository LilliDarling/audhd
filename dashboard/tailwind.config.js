const { createThemes } = require("tw-colors");
const esmRequire = require("esm")(module);
const twColors = require("tailwindcss/colors");
const twForms = require("@tailwindcss/forms")({
  strategy: "class",
});
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron"], // https://fonts.google.com/specimen/Orbitron?classification=Display&stroke=Sans+Serif
        montserrat: ["Montserrat"], // https://fonts.google.com/specimen/Montserrat
        poppins: ["Poppins"], // https://fonts.google.com/specimen/Poppins
      },
    },
  },
  plugins: [
    // vfSlider,
    twForms,
    // https://palettes.shecodes.io/
    createThemes(
      {
        light: {
          primary: twColors.amber["50"],
          secondary: twColors.zinc["600"],
          "pop-primary": twColors.rose["600"], // rose, teal, cyan,
          "pop-secondary": twColors.teal["600"],
        },
        dark: {
          primary: twColors.slate["900"],
          secondary: twColors.zinc["400"],
          "pop-primary": twColors.teal["400"],
          "pop-secondary": twColors.amber["400"],
        },
      },
      { defaultTheme: "light" },
    ),
  ],
  variants: {
    width: ["responsive", "hover", "focus", "active"],
    border: ["hover"],
    extend: {
      textColor: ["active"],
    },
  },
};
