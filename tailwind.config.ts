import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");

const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
    },
    colors: {
      transparent: "transparent",
      primary: {
        DEFAULT: "#040C5C",
        50: "#C3C4FD",
        100: "#9699FB",
        200: "#666DF8",
        300: "#2A3BF4",
        400: "#0F1FAB",
        500: "#040C5C",
      },
      secondary: {
        DEFAULT: "#00278F",
        50: "#EBF0FF",
        100: "#AFC5FF",
        200: "#376DFF",
        300: "#376DFF",
        400: "#1146D3",
        500: "#00278F",
      },
      blue: {
        DEFAULT: "#000C5B",
        50: "#EBEDFF",
        100: "#AFBAFF",
        200: "#7486FF",
        300: "#3249E3",
        400: "#0B1E9F",
        500: "#000C5B",
      },
      cyan: {
        DEFAULT: "#007077",
        50: "#E5FDFF",
        100: "#99F9FF",
        200: "#4CF4FF",
        300: "#00F0FF",
        400: "#00B0BB",
        500: "#007077",
      },
      violet: {
        DEFAULT: "#260077",
        50: "#EDE5FF",
        100: "#BA99FF",
        200: "#864CFF",
        300: "#5200FF",
        400: "#3C00BB",
        500: "#260077",
      },
      pink: {
        DEFAULT: "#770072",
        50: "#FEFAFE",
        100: "#FABFFC",
        200: "#FF86F9",
        300: "#FF2DF7",
        400: "#BB0CB4",
        500: "#770072",
      },
      gray: {
        DEFAULT: "#17171A",
        50: "#ECECED",
        100: "#C3C3C7",
        200: "#78787F",
        300: "#55555D",
        400: "#34343A",
        500: "#17171A",
      },
      brand: {
        dark: "#040C5C",
        blue: "#1146D3",
        deep: "#0B1E9F",
        cyan: "#00F0FF",
        violet: "#5200FF",
        pink: "#FF2DF7",
      },
    },
  },
  plugins: [],
};
export default config;
