import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ handle: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;
  const supabase = createSupabaseServerClient();

  // Fetch profile by handle (case-insensitive)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, handle, created_at")
    .ilike("handle", handle)
    .maybeSingle();

  if (profileError || !profile) {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>User not found</h1>
        <p>The requested profile could not be found.</p>
      </main>
    );
  }

  // Only select public bookmarks for this user
  const { data: bookmarks, error: bmError } = await supabase
    .from("bookmarks")
    .select("id, title, url, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (bmError) {
    return (
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
        <h1>Something went wrong</h1>
        <p>Unable to load public bookmarks.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <header>
        <h1>@{profile.handle}</h1>
        <p className="text-sm text-gray-600">Public bookmarks</p>
      </header>

      <section style={{ marginTop: 20 }}>
        {(!bookmarks || bookmarks.length === 0) && <p>No public bookmarks yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {bookmarks?.map((b: any) => (
            <li key={b.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                {b.title}
              </a>
              <div style={{ fontSize: 12, color: "#666" }}>{b.url}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
