import EditBookmarkForm from "./EditBookmarkForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = createSupabaseServerClient();

  const { data: bookmark, error } = await supabase
    .from("bookmarks")
    .select("id, title, url, is_public, user_id")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !bookmark) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold">Bookmark not found</h1>
        <p className="mt-2 text-sm text-gray-600">The requested bookmark was not found or you don't have access.</p>
      </div>
    );
  }

  return <EditBookmarkForm bookmark={bookmark} />;
}
