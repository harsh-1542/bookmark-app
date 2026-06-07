"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function validateUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_err) {
    return false;
  }
}

export type CreateBookmarkResult = { success: boolean; error?: string };

export async function createBookmark(
  title: string,
  url: string,
  is_public: boolean
): Promise<CreateBookmarkResult> {
  // Basic validation
  if (!title || title.trim().length === 0) {
    return { success: false, error: "Title is required." };
  }

  if (!url || !validateUrl(url)) {
    return { success: false, error: "Please provide a valid URL (http/https)." };
  }

  const supabase = createSupabaseServerClient();

  // Ensure user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Insert bookmark associated with the current user
  const { error: insertError } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title: title.trim(),
    url: url.trim(),
    is_public,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    return { success: false, error: insertError.message || "Failed to create bookmark." };
  }

  // Refresh client by redirecting to dashboard
  redirect("/dashboard");
}

export async function updateBookmark(
  id: string,
  title: string,
  url: string,
  is_public: boolean
): Promise<CreateBookmarkResult> {
  if (!id) return { success: false, error: "Bookmark id is required." };

  if (!title || title.trim().length === 0) {
    return { success: false, error: "Title is required." };
  }

  if (!url || !validateUrl(url)) {
    return { success: false, error: "Please provide a valid URL (http/https)." };
  }

  const supabase = createSupabaseServerClient();

  // Ensure user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Update bookmark only if it belongs to current user
  const { error: updateError } = await supabase
    .from("bookmarks")
    .update({ title: title.trim(), url: url.trim(), is_public })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message || "Failed to update bookmark." };
  }

  // Redirect back to dashboard (refreshes list)
  redirect("/dashboard");
}

export async function deleteBookmark(id: string): Promise<CreateBookmarkResult> {
  if (!id) return { success: false, error: "Bookmark id is required." };

  const supabase = createSupabaseServerClient();

  // Ensure user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { error: deleteError } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message || "Failed to delete bookmark." };
  }

  return { success: true };
}
