/**
 * Type-safe, centralised access to environment variables.
 *
 * Usage:
 *   import { env } from "@/config/env";
 *   console.log(env.NEXT_PUBLIC_APP_URL);
 *
 * Add validation (e.g. with zod) once you have required variables.
 */
export const env = {
  /** Base URL of the application (safe for client + server). */
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  /** Current runtime environment. */
  APP_ENV: process.env.APP_ENV ?? "development",
} as const;

export type Env = typeof env;
