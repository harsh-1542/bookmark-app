# Route Protection & Security

## Overview

This document explains how route protection is implemented and the security considerations for the bookmark app.

---

## Architecture

### Two-Layer Protection

1. **Middleware Layer** (Server-side)
   - First line of defense
   - Checks authentication before page load
   - Fast, prevents unnecessary client renders

2. **Component Layer** (Client-side)
   - Second line of defense
   - Additional auth checks in protected pages
   - Provides better UX (loading states, error handling)

---

## Route Protection Rules

### Protected Routes (Require Authentication)
- `/dashboard` — User dashboard
- `/bookmarks` — Bookmark management
- `/profile/*` — User profile pages

### Public Routes (No Authentication Required)
- `/login` — Login page
- `/signup` — Sign up page
- `/` — Home page (optional)

### Special Routes
- `/onboarding` — Accessible after signup, before profile creation

---

## Implementation

### 1. Middleware (`middleware.ts`)

```typescript
// Checks Supabase auth cookie (sb-auth-token)
// Redirects unauthenticated users → /login
// Redirects authenticated users away from /login, /signup → /dashboard
```

**How it works:**
- Runs on every request (BEFORE the page loads)
- Checks for `sb-auth-token` cookie
- Cookie is set by Supabase when user logs in
- If missing, user is not authenticated

**Advantages:**
- Fast (server-side check)
- Prevents page flickering (redirects before render)
- Protects API routes if added

### 2. Client-Side Hook (`useAuthProtection`)

```typescript
const { isAuthenticated, userId, isLoading } = useAuthProtection({
  redirectIfNotAuth: true,  // Auto-redirect if not authenticated
});
```

**What it does:**
- Calls `supabase.auth.getUser()` to verify session
- Returns auth state (loading, authenticated, userId)
- Can optionally redirect to login page
- Handles loading states during auth check

**Advantages:**
- Provides auth state for conditional rendering
- Handles edge cases (cookie expired but session valid)
- Better UX with loading indicators

---

## Security Considerations

### 1. Cookie-Based Authentication ✅

**How it works:**
- Supabase sets `sb-auth-token` cookie after successful login
- Cookie contains signed JWT token
- Browser automatically sends cookie with requests
- Middleware verifies cookie presence

**Security:**
- ✅ Cookies are secure (httpOnly flag set by Supabase)
- ✅ Cannot be accessed by JavaScript
- ✅ Automatically sent with cross-origin requests (SameSite protection)
- ✅ Token is signed; cannot be forged

### 2. Session Validation ⚠️

**Current Implementation:**
- Middleware only checks cookie *presence*
- Does NOT validate token signature (expensive)
- Client-side hook calls `getUser()` which validates session

**Trade-off:**
- **Fast middleware**: Only checks if cookie exists
- **Accurate client check**: Validates actual session
- **Why?** Prevents server load from validating every request

**Risk Mitigation:**
- If cookie is forged, `getUser()` call will fail
- User redirected to login
- No sensitive operations on middleware layer alone

### 3. Token Expiration

**Supabase Auth Tokens:**
- Access token: 1 hour expiration
- Refresh token: 1 year expiration
- Supabase auto-refreshes tokens before expiration

**Protection:**
- ✅ Expired access token → `getUser()` fails → redirect to login
- ✅ Refresh token handles transparent renewal
- ✅ User doesn't need to re-authenticate during session

### 4. CSRF Protection

**How it's protected:**
- POST/PUT/DELETE requests use server actions
- Server actions verify CSRF tokens (Next.js default)
- Middleware runs on every request, including navigation

**Example - Safe Form Submission:**
```typescript
// Server action automatically has CSRF protection
export async function completeOnboarding(handle: string) {
  // Only callable from authenticated client
  // Token verified by Next.js
}
```

### 5. XSS Prevention

**Measures:**
- ✅ React automatically escapes JSX content
- ✅ Sensitive tokens stored in HTTP-only cookies (not localStorage)
- ✅ No sensitive data in URL parameters
- ✅ Server actions prevent direct DB exposure

**Example:**
```typescript
// ❌ BAD - Token in localStorage (XSS-able)
localStorage.setItem("token", userToken);

// ✅ GOOD - Token in HTTP-only cookie (XSS-proof)
// Supabase handles this automatically
```

### 6. SQL Injection Prevention

**Protection:**
- ✅ Using Supabase query builder (parameterized queries)
- ✅ All user inputs validated before DB queries
- ✅ Handle uniqueness check uses parameterized query

**Example:**
```typescript
// ✅ Safe - parameterized query
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("handle", userInput);  // Parameterized, not concatenated

// ❌ Unsafe - SQL injection risk (don't do this)
// db.query(`SELECT * FROM profiles WHERE handle = '${userInput}'`);
```

### 7. Race Conditions

**Handle Uniqueness Check:**

**Potential Issue:**
```
User A checks "harsh" → available
User B checks "harsh" → available
User A saves "harsh" → success
User B saves "harsh" → database constraint violation
```

**Current Protection:**
- Database UNIQUE constraint on handle column
- If insert fails (duplicate), error returned to user
- User is asked to choose different handle

**Could be improved:** Add distributed lock or database-level check-and-set

### 8. Rate Limiting

**Current Status:** ❌ Not implemented

**Risks:**
- Brute force login attacks
- Handle checking spam
- Account enumeration

**Recommendations:**
- Add rate limiting middleware (Upstash, Cloudflare)
- Limit login attempts (5 per minute per IP)
- Limit handle checks (10 per minute per IP)

### 9. Data Exposure

**Protected by:**
- ✅ Row Level Security (RLS) policies (to be implemented)
- ✅ Server-side auth checks
- ✅ Middleware route protection

**Example - Current Risk:**
```typescript
// Client can query any bookmark (no RLS yet)
const { data } = await supabase
  .from("bookmarks")
  .select("*")  // Could get all bookmarks!
  .eq("is_public", false);
```

**Next Step:**
- Implement RLS policies to enforce user isolation
- Policy: Users can only see their own private bookmarks

---

## Security Best Practices Applied

| Practice | Implementation | Status |
|----------|----------------|--------|
| **Authentication** | Supabase Auth | ✅ |
| **HTTPS Only** | Production only | ✅ |
| **Secure Cookies** | HTTP-only, SameSite | ✅ |
| **CSRF Protection** | Next.js server actions | ✅ |
| **XSS Prevention** | React escaping, HTTP-only tokens | ✅ |
| **SQL Injection** | Parameterized queries | ✅ |
| **Rate Limiting** | Not implemented | ⚠️ |
| **Row Level Security** | To be implemented | ⚠️ |
| **CORS** | Not needed (server-side auth) | ✅ |
| **API Key Security** | NEXT_PUBLIC_ prefix only on client keys | ✅ |

---

## User Flow

### Unauthenticated User Trying to Access `/dashboard`

```
User navigates to /dashboard
           ↓
Middleware checks for sb-auth-token cookie
           ↓
Cookie not found
           ↓
Middleware redirects to /login
           ↓
Page never renders (prevents flicker)
```

### Authenticated User Accessing `/dashboard`

```
User navigates to /dashboard
           ↓
Middleware checks for sb-auth-token cookie
           ↓
Cookie found
           ↓
Page renders (next middleware/component layer)
           ↓
Component calls useAuthProtection()
           ↓
Hook calls supabase.auth.getUser()
           ↓
Session valid → show dashboard
           ↓
Session invalid → redirect to login
```

### Authenticated User Trying to Access `/login`

```
User navigates to /login
           ↓
Middleware checks for sb-auth-token cookie
           ↓
Cookie found (user authenticated)
           ↓
Middleware redirects to /dashboard
           ↓
No need to show login page to authenticated user
```

---

## Future Improvements

1. **Row Level Security (RLS)**
   - Enforce database-level access control
   - Prevent direct API access to other users' data

2. **Rate Limiting**
   - Protect against brute force attacks
   - Prevent spam and abuse

3. **Audit Logging**
   - Log authentication events
   - Track sensitive operations

4. **Two-Factor Authentication (2FA)**
   - Additional security layer
   - Verify via email or authenticator app

5. **Session Management**
   - View active sessions
   - Revoke sessions remotely

---

## Testing Route Protection

### Test 1: Unauthenticated Access
```bash
# Try accessing protected route without login
curl -L http://localhost:3000/dashboard
# Should redirect to /login
```

### Test 2: Authenticated Access
```bash
# After logging in, try accessing protected route
# Should show dashboard
```

### Test 3: Token Expiration
```bash
# Wait for token to expire (or simulate)
# Try making API call
# Should redirect to login
```

---

## Configuration

### Route Matrix

| Route | Guest | Authenticated | Status |
|-------|-------|---------------|--------|
| `/` | ✅ | ✅ | Public |
| `/login` | ✅ | ❌ Redirects to `/dashboard` | Auth |
| `/signup` | ✅ | ❌ Redirects to `/dashboard` | Auth |
| `/onboarding` | ❌ | ✅ | Protected |
| `/dashboard` | ❌ Redirects to `/login` | ✅ | Protected |
| `/bookmarks` | ❌ Redirects to `/login` | ✅ | Protected |
| `/profile/*` | ❌ Redirects to `/login` | ✅ | Protected |

---

## Conclusion

The bookmark app uses a **defense-in-depth** approach:

1. **Middleware** catches most unauthorized access early
2. **Client-side hooks** provide accurate auth state
3. **Server actions** handle sensitive operations securely
4. **Database constraints** prevent data corruption
5. **Supabase Auth** manages secure token handling

Next steps: Implement RLS policies and add rate limiting for production readiness.
