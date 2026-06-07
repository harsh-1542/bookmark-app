export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="sr-only">Loading…</span>
      {/* Replace with your spinner/skeleton component */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
    </div>
  );
}
