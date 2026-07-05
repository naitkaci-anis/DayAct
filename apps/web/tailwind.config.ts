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
        void: "#050816",
        panel: "#0b1020",
        deep: "rgba(255,255,255,0.045)",
        border: "rgba(255,255,255,0.08)",
        "act-cyan": "#5be7ff",
        "focus-violet": "#8b5cf6",
        accent: "#c026ff",
        "done-green": "#22c55e",
        "energy-amber": "#f59e0b",
        "alert-red": "#ef4444",
        text: "#f5f7ff",
        "text-muted": "#8a93b2",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "22px",
        xl: "28px",
      },
      borderWidth: {
        "0.5": "0.5px",
      },
    },
  },
  plugins: [],
};

export default config;
