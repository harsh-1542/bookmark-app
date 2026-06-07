"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import Link from "next/link";
import { deleteBookmark } from "@/app/actions/bookmarks";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState<string | null>(null);

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
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Link href={`/bookmarks/${bookmark.id}/edit`}>
                  <button style={{ padding: "6px 10px" }}>Edit</button>
                </Link>
                <button
                  onClick={() => {
                    setPendingDeleteTitle(bookmark.title);
                    setDeletingId(bookmark.id);
                    setShowConfirm(true);
                  }}
                  style={{ padding: "6px 10px", color: "#b00020" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirm && deletingId && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ background: "white", padding: 20, borderRadius: 8, maxWidth: 480, width: "90%" }}>
            <h3 style={{ margin: 0 }}>Delete bookmark?</h3>
            <p style={{ marginTop: 8 }}>Are you sure you want to delete "{pendingDeleteTitle}"? This action cannot be undone.</p>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setShowConfirm(false); setDeletingId(null); }}>Cancel</button>
              <button
                onClick={async () => {
                  try {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore-next-line
                    const res = await deleteBookmark(deletingId as string);
                    if (!res || res.success === false) {
                      setError(res?.error ?? "Failed to delete bookmark");
                      setShowConfirm(false);
                      return;
                    }
                    setBookmarks((prev) => prev.filter((b) => b.id !== deletingId));
                    setShowConfirm(false);
                    setDeletingId(null);
                  } catch (err: any) {
                    setError(err?.message || String(err));
                    setShowConfirm(false);
                    setDeletingId(null);
                  }
                }}
                style={{ background: "#b00020", color: "white", padding: "6px 10px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
