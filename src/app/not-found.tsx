import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">Page not found.</p>
      <Link href="/" className="underline underline-offset-4">
        Go home
      </Link>
    </main>
  );
}
