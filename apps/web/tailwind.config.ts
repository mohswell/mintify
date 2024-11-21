import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    './src/**/*.{ts,tsx}',
    '.src/app/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config