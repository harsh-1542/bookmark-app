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

  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey, {
    cookies: serverCookieMethods,
  });
};
