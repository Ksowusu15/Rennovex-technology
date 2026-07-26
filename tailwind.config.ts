import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070B14",
        panel: "#0D1322",
        line: "#1D2940",
        brand: {
          300: "#71D7FF",
          400: "#32B9F2",
          500: "#148CC4",
          600: "#0D6C9A"
        },
        violet: "#8B7CFF"
      },
      boxShadow: {
        glow: "0 0 50px rgba(50,185,242,.18)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
export default config;
