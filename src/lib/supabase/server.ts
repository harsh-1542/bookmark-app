import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { env } from "@/config/env";

const serverCookieMethods = {
  getAll: async () => {
    const requestCookies = await cookies();
    return requestCookies.getAll().map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));
  },
};

export const createSupabaseServerClient = () => {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  // Use anon/publishable key for server client that should forward the user's
  // session via cookies. Do NOT use the service role key here by default,
  // because the service role bypasses RLS and can expose data.
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey, {
    cookies: serverCookieMethods,
  });
};

// Admin server client using the service role key. Use only in trusted server contexts.
export const createSupabaseServerAdminClient = () => {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin client.");

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    cookies: serverCookieMethods,
  });
};
