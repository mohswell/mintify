import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          "gray-1": "#FAFAFA",
          "gray-2": "#F0F0F0",
          "gray-3": "#EFEFEF",
          "gray-4": "#E6E6E6",
          "gray-5": "#DDDDDD",
          "gray-6": "#A5A5A5",
          "gray-7": "#808080",
        },
        dark: {
          DEFAULT: "#1A1A1A",
          "2": "#202020",
          darker: "#0D0D0D",
          background: "#161616",
        },
      },
      screens: {
        xxs: "375px",
        xs: "430px",
        sm: "580px",
        md: "860px",
        lg: "1196px",
        xl: "1230px",
        "9xl": "1440px",
        "10xl": "1512px",
        "11xl": "1680px",
        "4k": "2560px",
      },
    },
  },
  plugins: [],
};

export default config;
