import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

interface UseAuthProtectionOptions {
  /**
   * If true, redirect to /login if not authenticated.
   * If false, just return the auth state without redirecting.
   * Default: true
   */
  redirectIfNotAuth?: boolean;
  /**
   * URL to redirect to if not authenticated.
   * Default: /login
   */
  redirectUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean | null; // null = loading
  userId: string | null;
  email: string | null;
  error: Error | null;
}

/**
 * Hook for protecting routes on the client side.
 * Checks if user is authenticated and provides auth state.
 *
 * Usage:
 * ```tsx
 * const { isAuthenticated, userId } = useAuthProtection({ redirectIfNotAuth: true });
 *
 * if (isAuthenticated === null) return <div>Loading...</div>;
 * if (!isAuthenticated) return <div>Not authenticated</div>; // Already redirected
 *
 * return <div>Protected content for user {userId}</div>;
 * ```
 */
export function useAuthProtection(
  options: UseAuthProtectionOptions = {}
): AuthState & { isLoading: boolean } {
  const { redirectIfNotAuth = true, redirectUrl = "/login" } = options;
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    userId: null,
    email: null,
    error: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          setAuthState({
            isAuthenticated: false,
            userId: null,
            email: null,
            error: null,
          });

          if (redirectIfNotAuth) {
            router.push(redirectUrl);
          }
          return;
        }

        setAuthState({
          isAuthenticated: true,
          userId: user.id,
          email: user.email || null,
          error: null,
        });
      } catch (err: any) {
        console.error("Auth check error:", err);
        setAuthState({
          isAuthenticated: false,
          userId: null,
          email: null,
          error: err,
        });

        if (redirectIfNotAuth) {
          router.push(redirectUrl);
        }
      }
    };

    checkAuth();
  }, [supabase, router, redirectIfNotAuth, redirectUrl]);

  return {
    ...authState,
    isLoading: authState.isAuthenticated === null,
  };
}
