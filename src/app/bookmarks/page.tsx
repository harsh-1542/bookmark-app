"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import Link from "next/link";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

export default function BookmarksPage() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthProtection({
    redirectIfNotAuth: true,
  });
  const supabase = createSupabaseClient();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch bookmarks if authenticated and we have a userId
    if (!isAuthenticated || !userId) {
      return;
    }

    const fetchBookmarks = async () => {
      try {
        // Fetch user's bookmarks from bookmarks table
        const { data, error: fetchError } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError("Failed to load bookmarks");
          return;
        }

        setBookmarks(data as Bookmark[]);
      } catch (err: any) {
        setError(err?.message || String(err));
      } finally {
        setBookmarksLoading(false);
      }
    };

    fetchBookmarks();
  }, [isAuthenticated, userId, supabase]);

  // Show loading while checking authentication
  if (authLoading || (isAuthenticated && bookmarksLoading)) {
    return <main style={{ padding: "2rem" }}>Loading…</main>;
  }

  if (error)
    return <main style={{ padding: "2rem", color: "#b00020" }}>Error: {error}</main>;

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Bookmarks</h1>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button style={{ padding: "8px 16px" }}>Back to Dashboard</button>
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <p>No bookmarks yet. Create your first bookmark to get started!</p>
      ) : (
        <div>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "4px",
              }}
            >
              <h3>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                  {bookmark.title}
                </a>
              </h3>
              <p style={{ color: "#666", margin: "0.5rem 0" }}>{bookmark.url}</p>
              <p style={{ fontSize: "0.875rem", color: "#999" }}>
                {bookmark.is_public ? "🌍 Public" : "🔒 Private"} •{" "}
                {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
