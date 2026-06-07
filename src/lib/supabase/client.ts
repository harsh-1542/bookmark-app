"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

export const createSupabaseClient = () => {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);
};
