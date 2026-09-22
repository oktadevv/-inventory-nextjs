import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"] },
      borderRadius: { xl: "12px" },
    },
  },
  plugins: [],
};
export default config;
