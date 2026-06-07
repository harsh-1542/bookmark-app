"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthProtection } from "@/hooks/useAuthProtection";

interface Profile {
  id: string;
  email: string;
  handle: string;
  created_at: string;
}

export default function DashboardPage() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthProtection({
    redirectIfNotAuth: true,
  });
  const supabase = createSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch profile if authenticated and we have a userId
    if (!isAuthenticated || !userId) {
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile from profiles table
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (fetchError) {
          setError("Failed to load profile");
          return;
        }

        setProfile(data as Profile);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, userId, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Router push happens automatically via middleware redirect
  };

  // Show loading while checking authentication
  if (authLoading || (isAuthenticated && profileLoading)) {
    return <main style={{ padding: "2rem" }}>Loading…</main>;
  }

  if (error)
    return <main style={{ padding: "2rem", color: "#b00020" }}>Error: {error}</main>;

  if (!profile)
    return <main style={{ padding: "2rem" }}>Profile not found</main>;

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: "8px 16px" }}>
          Logout
        </button>
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2>Profile</h2>
        <p>
          <strong>Handle:</strong> @{profile.handle}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Member Since:</strong> {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Bookmarks</h2>
        <p>Bookmark management coming soon.</p>
      </section>
    </main>
  );
}
