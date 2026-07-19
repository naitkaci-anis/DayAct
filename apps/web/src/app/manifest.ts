import type { MetadataRoute } from "next";

// PWA manifest — makes DayAct installable on phone home screens.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DayAct — Productivité & bien-être",
    short_name: "DayAct",
    description:
      "Tâches, calendrier, habitudes et assistant IA — agis sur ta journée.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#050816",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
