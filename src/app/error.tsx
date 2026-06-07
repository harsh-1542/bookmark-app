"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: send to error reporting service (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">Something went wrong.</h2>
      <button
        onClick={reset}
        className="rounded border px-4 py-2 text-sm hover:bg-accent"
      >
        Try again
      </button>
    </main>
  );
}
