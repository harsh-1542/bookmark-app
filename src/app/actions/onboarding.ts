"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface HandleValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validates handle format.
 * Rules:
 * - 3-30 characters
 * - Lowercase letters, numbers, hyphens, underscores
 * - Must start with a letter
 * - No consecutive hyphens or underscores
 */
export function validateHandleFormat(handle: string): HandleValidationResult {
  if (!handle) {
    return { success: false, error: "Handle is required." };
  }

  const trimmed = handle.trim().toLowerCase();

  if (trimmed.length < 3) {
    return { success: false, error: "Handle must be at least 3 characters." };
  }

  if (trimmed.length > 30) {
    return { success: false, error: "Handle must be at most 30 characters." };
  }

  // Must start with a letter
  if (!/^[a-z]/.test(trimmed)) {
    return { success: false, error: "Handle must start with a letter." };
  }

  // Only lowercase letters, numbers, hyphens, underscores
  if (!/^[a-z0-9_-]+$/.test(trimmed)) {
    return {
      success: false,
      error: "Handle can only contain letters, numbers, hyphens, and underscores.",
    };
  }

  // No consecutive hyphens or underscores
  if (/[-_]{2,}/.test(trimmed)) {
    return {
      success: false,
      error: "Handle cannot contain consecutive hyphens or underscores.",
    };
  }

  return { success: true };
}

/**
 * Checks if handle is already taken in the database.
 * Query: SELECT COUNT(*) FROM profiles WHERE LOWER(handle) = $1
 */
export async function checkHandleUniqueness(
  handle: string
): Promise<HandleValidationResult> {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("handle", handle.toLowerCase());

    if (error) {
      console.error("Handle uniqueness check error:", error);
      return {
        success: false,
        error: "Error checking handle availability. Please try again.",
      };
    }

    // If count > 0, handle is taken
    if (data && data.length > 0) {
      return { success: false, error: "Handle is already taken." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Handle uniqueness check exception:", err);
    return {
      success: false,
      error: "Error checking handle availability. Please try again.",
    };
  }
}

/**
 * Complete onboarding: validate handle, check uniqueness, and create profile.
 * Creates profile record with user's email and handle.
 * Redirects to dashboard on success.
 */
export async function completeOnboarding(
  handle: string
): Promise<HandleValidationResult> {
  // Validate format
  const formatCheck = validateHandleFormat(handle);
  if (!formatCheck.success) {
    return formatCheck;
  }

  // Check uniqueness
  const uniquenessCheck = await checkHandleUniqueness(handle);
  if (!uniquenessCheck.success) {
    return uniquenessCheck;
  }

  const supabase = createSupabaseServerClient();

  try {
    // Get current user from auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Authentication error. Please log in again.",
      };
    }

    // Insert profile with user ID and handle
    // Query: INSERT INTO profiles (id, email, handle, created_at) VALUES ($1, $2, $3, now())
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      handle: handle.toLowerCase(),
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Profile creation error:", insertError);
      // If it's a unique constraint violation, return appropriate message
      if (insertError.code === "23505") {
        return { success: false, error: "Handle is already taken." };
      }
      return {
        success: false,
        error: "Error creating profile. Please try again.",
      };
    }

    // Success: redirect to dashboard
    redirect("/dashboard");
  } catch (err: any) {
    console.error("Onboarding exception:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
