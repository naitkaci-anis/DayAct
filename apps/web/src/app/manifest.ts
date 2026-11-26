import type { MetadataRoute } from "next";

// PWA manifest — makes DayAct installable on phone home screens.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "DayAct — Productivité & bien-être",
    short_name: "DayAct",
    description:
      "Tâches, calendrier, habitudes et assistant IA — agis sur ta journée.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F1E7D8",
    theme_color: "#F1E7D8",
    lang: "fr",
    categories: ["productivity", "lifestyle", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Tâches", url: "/dashboard/tasks" },
      { name: "Calendrier", url: "/dashboard/calendar" },
    ],
  };
}
