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
 * - Cannot be a reserved system handle
 */
export async function validateHandleFormat(handle: string): Promise<HandleValidationResult> {
  if (!handle) {
    return { success: false, error: "Handle is required." };
  }

  const trimmed = handle.trim().toLowerCase();

  // Reserved handles that cannot be used
  const reserved = [
    "admin",
    "dashboard",
    "login",
    "signup",
    "onboarding",
    "bookmarks",
    "api",
    "app",
    "help",
    "support",
    "system",
  ];

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
      error: "Handle can only contain lowercase letters, numbers, hyphens, and underscores.",
    };
  }

  // No consecutive hyphens or underscores
  if (/[-_]{2,}/.test(trimmed)) {
    return {
      success: false,
      error: "Handle cannot contain consecutive hyphens or underscores.",
    };
  }

  // Cannot end with hyphen or underscore
  if (/[-_]$/.test(trimmed)) {
    return {
      success: false,
      error: "Handle cannot end with a hyphen or underscore.",
    };
  }

  // Check if handle is reserved
  if (reserved.includes(trimmed)) {
    return {
      success: false,
      error: "This handle is reserved. Please choose another.",
    };
  }

  return { success: true };
}

/**
 * Checks if handle is already taken in the database.
 * Uses .maybeSingle() to check if any matching row exists.
 */
export async function checkHandleUniqueness(
  handle: string
): Promise<HandleValidationResult> {
  const normalizedHandle = handle.trim().toLowerCase();

  if (!normalizedHandle) {
    return { success: false, error: "Handle is required." };
  }

  const supabase = createSupabaseServerClient();

  try {
    // Check if any row exists with this handle
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", normalizedHandle)
      .maybeSingle();

    if (error) {
      console.error("Handle uniqueness check error:", error);
      return {
        success: false,
        error: "Error checking handle availability. Please try again.",
      };
    }

    // If data is not null, handle exists
    if (data) {
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
  const formatCheck = await validateHandleFormat(handle);
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
