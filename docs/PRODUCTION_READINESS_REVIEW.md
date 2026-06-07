# Production Readiness Review

This document summarizes a production readiness review performed on the Bookmark App. It enumerates findings across Security, Authentication, Authorization, Database design, Public profile logic, Environment variables, Error handling, and Performance, and provides actionable fixes.

## 1. Security

- Weakness: Service role key risk — earlier code used the Supabase service role key in server client by default.
  - Fix: Ensure `SUPABASE_SERVICE_ROLE_KEY` is only used in `createSupabaseServerAdminClient()` and is never exposed to client bundles. Rotate key if accidentally committed.

- Weakness: Missing HTTPS enforcement and secure cookie flags in some deployments.
  - Fix: Enforce HTTPS in production, set `Secure`, `HttpOnly`, and `SameSite=Lax` or `Strict` on cookies, and use `Secure` in production-only code paths.

- Weakness: Email API key (Resend) stored improperly.
  - Fix: Store `RESEND_API_KEY` in environment variables, never commit. Use provider secret storage.

- Weakness: No Content-Security-Policy (CSP) or XSS hardening documented.
  - Fix: Add CSP header, escape/render untrusted content carefully, sanitize any HTML stored/displayed.

## 2. Authentication

- Weakness: Password policy is minimal (only length check).
  - Fix: Enforce stronger password policies server-side (zxcvbn or server-side checks), consider email verification and rate limiting for signups.

- Weakness: No account lockout / rate limiting on auth endpoints.
  - Fix: Add rate limiting (per IP and per account) and consider abnormal activity alerts.

- Weakness: Session expiration details not enforced.
  - Fix: Ensure sessions expire and refresh tokens are handled securely. Prefer short-lived access tokens and rotate refresh tokens.

## 3. Authorization

- Weakness: Potential RLS bypass if service-role key is used incorrectly.
  - Fix: Audit all server-side code to ensure admin client is only used in trusted contexts. Use RLS for row-level protection.

- Weakness: No granular audit/logging for destructive actions (delete/update).
  - Fix: Add DB triggers or server logs to record who performed updates/deletes, when, and what changed.

## 4. Database design

- Weakness: `profiles` and `bookmarks` should enforce constraints.
  - Fix: Add NOT NULL constraints, FK constraints: `bookmarks.user_id` REFERENCES `profiles(id)` ON DELETE CASCADE. Add unique constraint on `profiles.handle`.

- Weakness: No indexes on common query columns (e.g., `bookmarks.user_id`, `bookmarks.is_public`, `profiles.handle`).
  - Fix: Add indexes for `bookmarks(user_id, created_at)`, `bookmarks(is_public)`, `profiles(handle)`.

## 5. Public profile logic

- Weakness: `ilike(handle)` search can be slow without index; case-insensitive unique constraint recommended.
  - Fix: Store normalized handle (lowercase) and enforce `LOWER(handle)` uniqueness; index it.

- Weakness: Public pages may expose large result sets.
  - Fix: Paginate public bookmarks, limit page size, and use caching/CDN for profile pages.

## 6. Environment variables

- Weakness: Multiple Supabase keys and fallbacks can cause ambiguity.
  - Fix: Standardize on `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for client and `SUPABASE_SERVICE_ROLE_KEY` only for admin tasks.

- Weakness: No secret rotation or storage guidance.
  - Fix: Use cloud provider secret manager, rotate keys periodically, and restrict service-role permissions when possible.

## 7. Error handling

- Weakness: Several server actions return generic errors to client; lacking structured error codes.
  - Fix: Standardize error responses with codes and handle expected vs unexpected errors separately. Log server-side details, but return minimal messages to clients.

- Weakness: Email send is fire-and-forget from client; no retry/backoff or alerting.
  - Fix: Implement server-side queuing (e.g., background job or webhook retries) for reliability and monitoring.

## 8. Performance

- Weakness: Unpaginated bookmark queries on dashboard and public pages.
  - Fix: Add pagination (limit/offset or cursor-based) for both dashboard and public profile endpoints.

- Weakness: No caching for public pages.
  - Fix: Use CDN/edge caching for public profile pages and cache DB queries where appropriate.

- Weakness: Potential N+1 queries for profile/bookmarks in some paths.
  - Fix: Fetch profile and bookmarks in parallel and select only required columns.

---

## Recommended immediate fixes (high priority)

1. Apply RLS policies from `docs/bookmarks_rls.sql` and ensure server code does not use service-role key by default.
2. Add DB constraints and indexes (foreign keys, unique handle, indexes on user_id/is_public/handle).
3. Implement pagination for bookmarks endpoints and public profile pages.
4. Store secrets in environment variables and secret manager; rotate service-role key if exposed.
5. Add logging/audit for destructive operations and failed login attempts.
