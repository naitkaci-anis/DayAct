// Theme choice (Nuit by default). The colours themselves live in globals.css;
// this file only switches the <html data-theme="…"> attribute and remembers it.

export type ThemeId = "nuit" | "sauge";

export const THEMES: { id: ThemeId; name: string; description: string; swatches: string[]; bar: string }[] = [
  {
    id: "nuit",
    name: "Nuit",
    description: "Noir, bleu cobalt et vert citron",
    swatches: ["#030407", "#1558C9", "#D4FF24"],
    bar: "#030407",
  },
  {
    id: "sauge",
    name: "Sauge",
    description: "Crème, gris sauge et bordeaux",
    swatches: ["#E8D2B5", "#A5A79B", "#590907"],
    bar: "#F1E7D8",
  },
];

export const DEFAULT_THEME: ThemeId = "nuit";
const KEY = "dayact-theme";

export function getTheme(): ThemeId {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const t = document.documentElement.dataset.theme;
  return t === "sauge" || t === "nuit" ? t : DEFAULT_THEME;
}

export function setTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* private mode: the choice lasts for this visit only */
  }
  const bar = THEMES.find((t) => t.id === id)?.bar;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (bar && meta) meta.setAttribute("content", bar);
}

// Runs before the first paint so the page never flashes the wrong theme.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="sauge"||t==="nuit"){document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m&&t==="sauge")m.setAttribute("content","#F1E7D8");}}catch(e){}})();`;
