// Public address of the site, used for SEO (sitemap, robots, social previews).
// Set NEXT_PUBLIC_SITE_URL in Vercel when you get your own domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://day-act-web-sand.vercel.app").replace(/\/$/, "");
