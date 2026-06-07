import { env } from "./env";

export const siteConfig = {
  name: "Bookmarks App",
  description: "A clean, fast bookmark manager.",
  url: env.NEXT_PUBLIC_APP_URL,
} as const;
