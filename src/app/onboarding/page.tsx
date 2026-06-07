"use client";

import React, { useState } from "react";
import { completeOnboarding, validateHandleFormat } from "@/app/actions/onboarding";

export default function OnboardingPage() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side format validation
    const validation = validateHandleFormat(handle);
    if (!validation.success) {
      setError(validation.error || "Invalid handle");
      return;
    }

    setLoading(true);

    try {
      // Server action: checks uniqueness and creates profile
      const result = await completeOnboarding(handle);
      if (!result.success) {
        setError(result.error || "Failed to complete onboarding");
      }
      // On success, completeOnboarding redirects to /dashboard
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Complete Your Profile</h1>
      <p>Choose a unique handle for your public profile.</p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Handle
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g., harsh, johnsmith, alex123"
            required
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
          <small style={{ display: "block", marginTop: 4, color: "#666" }}>
            3-30 characters, letters/numbers/hyphens/underscores. Must start with a letter.
          </small>
        </label>

        {error && (
          <div style={{ color: "#b00020", marginBottom: 8 }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Setting up profile…" : "Complete Onboarding"}
        </button>
      </form>
    </main>
  );
}
