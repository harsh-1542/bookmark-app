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

  /** Supabase public client URL. */
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",

  /** Supabase publishable key for browser usage. */
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",

  /** Supabase secret anon key (fallback). */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",

  /** Supabase service role key for secure server usage. */
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  /** Resend API key for sending transactional emails (store in env). */
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",

  /** From address for transactional emails e.g. 'Your App <no-reply@example.com>' */
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "no-reply@example.com",
} as const;

export type Env = typeof env;
