"use client";

import React, { useState, useEffect } from "react";
import { completeOnboarding, validateHandleFormat } from "@/app/actions/onboarding";

export default function OnboardingPage() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time format validation as user types
  useEffect(() => {
    const validate = async () => {
      if (!handle) {
        setValidationError(null);
        return;
      }

      const result = await validateHandleFormat(handle);
      if (!result.success) {
        setValidationError(result.error || "Invalid handle");
      } else {
        setValidationError(null);
      }
    };

    validate();
  }, [handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent submission if format validation failed
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!handle.trim()) {
      setError("Handle is required.");
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

  const isValid = handle.trim().length > 0 && !validationError;

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
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, borderColor: validationError ? "#b00020" : undefined }}
          />
          <small style={{ display: "block", marginTop: 4, color: "#666" }}>
            3–30 characters. Start with a letter. Lowercase letters, numbers, hyphens, underscores allowed.
          </small>
        </label>

        {validationError && (
          <div style={{ color: "#b00020", marginBottom: 8, fontSize: "0.875rem" }}>
            {validationError}
          </div>
        )}

        {error && (
          <div style={{ color: "#b00020", marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !isValid} style={{ padding: "8px 16px", opacity: !isValid ? 0.5 : 1 }}>
          {loading ? "Setting up profile…" : "Complete Onboarding"}
        </button>
      </form>
    </main>
  );
}
