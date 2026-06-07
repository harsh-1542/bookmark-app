import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Runtime environment variables ─────────────────────────────────────
   * Variables listed here are exposed to the Node.js runtime (server-side).
   * Never put secrets inside `publicRuntimeConfig` — those go to the browser.
   * ─────────────────────────────────────────────────────────────────────── */
  env: {
    // Add server-side env vars here when needed, e.g.:
    // APP_ENV: process.env.APP_ENV,
  },

  /* ─── Experimental features ─────────────────────────────────────────── */
  experimental: {
    // typedRoutes: true, // Uncomment for fully-typed <Link href="…"> paths
  },
};

export default nextConfig;
