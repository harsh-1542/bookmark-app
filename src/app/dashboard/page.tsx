"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  handle: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Fetch profile from profiles table
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          setError("Failed to load profile");
          return;
        }

        setProfile(data as Profile);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <main style={{ padding: "2rem" }}>Loading…</main>;

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
