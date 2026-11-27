import type { Config } from "tailwindcss";

// Every colour points at a CSS variable defined in src/app/globals.css.
// To change the look of the whole app, edit the variables there — not here.
const rgb = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: rgb("canvas"),
        panel: rgb("panel"),
        surface: "var(--surface)",
        field: rgb("field"),
        line: rgb("line"),
        "line-strong": rgb("line-strong"),
        primary: rgb("primary"),
        "primary-hover": rgb("primary-hover"),
        secondary: rgb("secondary"),
        "secondary-ink": rgb("secondary-ink"),
        accent: rgb("accent"),
        sage: rgb("sage"),
        cream: rgb("cream"),
        success: rgb("success"),
        warning: rgb("warning"),
        danger: rgb("danger"),
        ink: rgb("ink"),
        "ink-muted": rgb("ink-muted"),
        "on-fill": rgb("on-fill"),
        "on-secondary": rgb("on-secondary"),
        scrim: "var(--scrim)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
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
