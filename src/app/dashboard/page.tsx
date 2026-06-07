"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { deleteBookmark } from "@/app/actions/bookmarks";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  handle: string;
  created_at: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthProtection({
    redirectIfNotAuth: true,
  });

  const supabase = createSupabaseClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: userRes }, { data: bmRes }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).single(),
          supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

        if (userRes) setProfile(userRes as Profile);
        if (bmRes) setBookmarks(bmRes as Bookmark[]);
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, supabase]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Profile */}
        <aside className="w-full lg:w-1/4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
              {profile?.handle?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">@{profile?.handle}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-400">Member since</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{profile ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
          </div>

          <div className="mt-6">
            <Link href="/bookmarks/new">
              <a className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md">
                Create Bookmark
              </a>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="w-full lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Bookmarks</h1>
            <Link href="/bookmarks/new">
              <a className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-sm rounded-md">
                + New Bookmark
              </a>
            </Link>
          </div>

          {bookmarks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white dark:bg-gray-900 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookmarks yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Save links to keep them here. Your bookmarks are private by default.</p>
              <div className="mt-4">
                <Link href="/bookmarks/new">
                  <a className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Create your first bookmark</a>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarks.map((bm) => (
                <article key={bm.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-indigo-600">
                        <a href={bm.url} target="_blank" rel="noopener noreferrer">{bm.title}</a>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{bm.url}</p>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(bm.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bm.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {bm.is_public ? 'Public' : 'Private'}
                    </span>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/bookmarks/${bm.id}/edit`}>
                        <a className="text-sm px-2 py-1 border rounded">Edit</a>
                      </Link>
                      <button
                        onClick={() => {
                          setPendingDeleteTitle(bm.title);
                          setDeletingId(bm.id);
                          setShowConfirm(true);
                        }}
                        className="text-sm px-2 py-1 border rounded text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Confirm modal */}
      {showConfirm && deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow max-w-md w-full">
            <h3 className="text-lg font-semibold">Delete bookmark?</h3>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete "{pendingDeleteTitle}"? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowConfirm(false); setDeletingId(null); }} className="px-3 py-2 border rounded">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore-next-line
                    const res = await deleteBookmark(deletingId);
                    if (!res || res.success === false) {
                      setError(res?.error ?? "Failed to delete bookmark");
                      setShowConfirm(false);
                      return;
                    }
                    // remove from state immediately
                    setBookmarks((prev) => prev.filter((b) => b.id !== deletingId));
                    setShowConfirm(false);
                    setDeletingId(null);
                  } catch (err: any) {
                    setError(err?.message || String(err));
                    setShowConfirm(false);
                    setDeletingId(null);
                  }
                }}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
