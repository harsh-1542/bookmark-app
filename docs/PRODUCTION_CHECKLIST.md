# Production Checklist

Use this checklist before deploying to production. Mark items complete as you validate them.

## Security

- [ ] Ensure `docs/bookmarks_rls.sql` is applied to the production database.
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is not present in client bundles or `.env` checked into source.
- [ ] Enforce HTTPS and `Secure` cookie flag in production.
- [ ] Add Content-Security-Policy headers and XSS protections.
- [ ] Rotate secrets and enable secret manager storage.

## Authentication & Authorization

- [ ] Enforce strong password policy and email verification.
- [ ] Implement rate limiting and account lockout protections.
- [ ] Confirm RLS policy prevents cross-user access.
- [ ] Add audit logs for update/delete operations.

## Database

- [ ] Add FK constraint `bookmarks.user_id -> profiles.id` and `ON DELETE CASCADE`.
- [ ] Add unique constraint on `profiles.handle` and normalize handles to lowercase.
- [ ] Add indexes: `bookmarks(user_id, created_at)`, `bookmarks(is_public)`, `profiles(handle)`.
- [ ] Backup strategy in place and tested.

## Public profile and API

- [ ] Implement pagination and enforce page size limits on profile pages.
- [ ] Cache public profile pages at edge/CDN where appropriate.
- [ ] Validate that private bookmarks are not exposed via API or client queries.

## Emailing

- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in production environment via secrets manager.
- [ ] Add retry/backoff or queueing for email sending.
- [ ] Monitor bounce/failure rates and set alerts.

## Error handling & monitoring

- [ ] Implement structured error responses and central logging (Sentry/Datadog).
- [ ] Add health checks and uptime monitoring.
- [ ] Configure alerts for failed DB migrations, high error rates, or auth anomalies.

## Performance

- [ ] Add pagination for listing endpoints.
- [ ] Load test the API and database under expected concurrency.
- [ ] Add caching for public pages and static assets.

## Deployment

- [ ] Ensure environment variables are configured in deployment environment.
- [ ] Run `npm run type-check` and unit tests.
- [ ] Run DB migrations and verify schema (constraints and indexes applied).
