-- Bookmarks Row Level Security (RLS) - strict owner-only access
-- Run these commands in your Supabase SQL editor (or psql against the database)

-- 1) Enable RLS on the bookmarks table
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 2) Make sure no default public access is granted
REVOKE ALL ON public.bookmarks FROM public;

-- 3) Allow SELECT for either the owner OR when the bookmark is public
CREATE POLICY "Bookmarks: select owner or public"
  ON public.bookmarks
  FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- 4) Allow authenticated users to INSERT rows where they are the owner
CREATE POLICY "Bookmarks: insert only as owner"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 5) Allow authenticated users to UPDATE only their own rows and ensure user_id remains theirs
CREATE POLICY "Bookmarks: update only own rows"
  ON public.bookmarks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6) Allow authenticated users to DELETE only their own rows
CREATE POLICY "Bookmarks: delete only own rows"
  ON public.bookmarks
  FOR DELETE
  USING (user_id = auth.uid());

-- 7) (Optional) If you need to allow server-side service-role operations, use
-- the service role key only in trusted server contexts. Service role bypasses RLS.

-- 8) Verify policies: run a SELECT as a non-owner user and confirm no rows returned.
