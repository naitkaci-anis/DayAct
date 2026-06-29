import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: "#0a0a14",
        deep: "#111827",
        border: "#1f2937",
        "act-cyan": "#06b6d4",
        "focus-violet": "#a78bfa",
        "done-green": "#4ade80",
        "energy-amber": "#fbbf24",
        "alert-red": "#f87171",
        text: "#f9fafb",
        "text-muted": "#6b7280",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
