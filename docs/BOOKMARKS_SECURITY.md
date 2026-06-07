# Bookmarks Security and RLS

Summary

- Goal: strict owner-only access for the `bookmarks` table.
- Approach: enable Row Level Security (RLS) and add policies that only allow authenticated users to act on rows where `user_id = auth.uid()`.

SQL

- See `docs/bookmarks_rls.sql` for the exact SQL to run in Supabase.

Who can do what (strict)

- View: the owner (row where `user_id = auth.uid()`) and any row where `is_public = true`.
- Create: only when `user_id` equals the authenticated user's id.
- Update: only the owner; `user_id` must remain equal to `auth.uid()`.
- Delete: only the owner.

Implementation notes in the app

- Client code uses the public/anon key and relies on RLS to restrict data.
- Server actions call `supabase.auth.getUser()` and include `user_id` from the authenticated session when inserting/updating/deleting. That means these operations run as the authenticated user (not service-role), so RLS is applied as expected.
- Do NOT embed the Supabase service-role key in client code. Use it only in trusted server contexts (edge functions, server-only code) and only when needed.

Potential attack scenarios and mitigations

1. Malicious client attempts to update another user's bookmark by changing `user_id` in payload

- Attack: client crafts an update/insert that sets `user_id` to someone else's id.
- Why prevented: RLS `WITH CHECK (user_id = auth.uid())` and `USING (user_id = auth.uid())` ensure both the target row and the new/updated row must belong to the authenticated user. Since the client is authenticated as the attacker, `auth.uid()` will be the attacker's id, so checks fail for other ids.

2. Malicious client tries to delete someone else's bookmark by calling a delete endpoint

- Attack: client calls delete with another row id.
- Why prevented: RLS `FOR DELETE USING (user_id = auth.uid())` ensures only rows where `user_id` equals the authenticated user can be deleted. The delete will affect 0 rows and return an error.

3. Leaked anon key used to read all bookmarks

- Attack: attacker uses the anon publishable key directly to query bookmarks.
- Why prevented: With RLS enforced, the anon key (which represents an unauthenticated or authenticated client depending on cookies) cannot read other users' rows because SELECT policy requires `user_id = auth.uid()`. If the anon key is used without a session, `auth.uid()` is null and no rows match.

4. Service-role key misuse

- Attack: service-role key embedded in client code could bypass RLS and expose/modify data.
- Why prevented: Do not store service-role key in client code. If accidentally leaked, revoke the key and rotate it. Treat the service-role key as a secret with restricted access.

5. Privilege escalation via server action

- Attack: a server action uses elevated privileges to update arbitrary rows.
- Why prevented: Avoid using service-role in server actions that run on behalf of a user; instead, use server client that forwards the user's session (cookies). If a service-role operation is required, ensure it's performed only in trusted contexts and enforces its own checks.

Additional recommendations

- Audit other tables (`profiles`, etc.) and add RLS policies where applicable.
- Add DB constraints (foreign key `user_id` references `profiles(id)`) and NOT NULL constraints to reduce injection/abuse surface.
- Use rate limiting and logging on server endpoints to detect abuse.
- Consider function-based access (Postgres functions that run as a secure definer) for complex operations that must bypass RLS.
