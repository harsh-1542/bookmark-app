"use client";

import React, { useState } from "react";
import { updateBookmark } from "@/app/actions/bookmarks";
import { useRouter } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
};

export default function EditBookmarkForm({ bookmark }: { bookmark: Bookmark }) {
  const [title, setTitle] = useState(bookmark.title ?? "");
  const [url, setUrl] = useState(bookmark.url ?? "");
  const [isPublic, setIsPublic] = useState(!!bookmark.is_public);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required.";
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "URL must start with http:// or https://";
    } catch (_err) {
      return "Please enter a valid URL.";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clientValidation = validate();
    if (clientValidation) {
      setError(clientValidation);
      return;
    }

    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      const res = await updateBookmark(bookmark.id, title, url, isPublic);

      if (res && res.success === false) {
        setError(res.error ?? "Failed to update bookmark.");
        setLoading(false);
        return;
      }

      // On success the server action will redirect; as a fallback, navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || String(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Edit Bookmark</h1>

      <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="A descriptive title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center gap-3">
          <input id="isPublic" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 text-indigo-600" />
          <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-200">Make this bookmark public</label>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>

          <button type="button" onClick={() => router.back()} className="px-3 py-2 border rounded-md">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
