# Database Design Decisions & Rationale

## Overview

This document explains the architectural decisions made in the bookmark app database schema and justifies each choice for scalability, performance, and maintainability.

---

## 1. Primary Key Strategy: UUID vs SERIAL

### Decision: UUID
```sql
id UUID PRIMARY KEY
```

### Rationale

| Aspect | UUID | SERIAL |
|--------|------|--------|
| **Scalability** | Globally unique; can merge databases | Sequential; problematic in distributed systems |
| **Privacy** | IDs don't reveal user count | Leaks database growth info |
| **Distribution** | Generates client-side; no DB round-trip | Requires DB sequence lookup |
| **URL Safety** | Works in URLs without encoding | Can be sequential and guessable |

### Example Impact
- **Sequential IDs**: User #42 exists, profile URL `/users/42` suggests only ~42 users exist.
- **UUIDs**: `/users/550e8400-e29b-41d4-a716-446655440000` reveals no information.

**Decision**: UUID provides security and scalability without performance penalty (PostgreSQL optimizes UUID storage).

---

## 2. User Representation: Profiles Table

### Decision
Separate `profiles` table that extends Supabase Auth.

### Rationale

```
Supabase Auth (managed)          Application Database (custom)
┌──────────────────┐             ┌──────────────────┐
│  auth.users      │ ----1:1---- │  profiles        │
│                  │             │                  │
│ - id (UUID)      │             │ - id (UUID)      │
│ - email          │             │ - email          │
│ - password_hash  │             │ - handle         │
│ - ...metadata    │             │ - created_at     │
└──────────────────┘             └──────────────────┘
```

### Why Not Store Everything in auth.users?
1. **Separation of Concerns**: Auth metadata stays in Supabase Auth; business data in custom schema.
2. **Access Control**: Profiles table can have RLS policies; auth.users is system-managed.
3. **Flexibility**: Easy to add application-specific fields (e.g., `bio`, `avatar_url`, `website`) without modifying auth.
4. **Replication**: Can replicate custom data to other services; auth.users is protected.

---

## 3. Email & Handle Uniqueness

### Decision
Both email and handle are UNIQUE constraints at the database level.

### Email Uniqueness
```sql
ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_email UNIQUE (email);
```

**Why:**
- Matches Supabase Auth's uniqueness requirement.
- Enables fast email-based lookups for login: `SELECT * FROM profiles WHERE email = ?`.
- Index supports both equality and range queries.

### Handle Uniqueness
```sql
ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_handle UNIQUE (handle);
```

**Why:**
- Enables deterministic profile URLs: `/@{handle}`.
- Must be globally unique (two users cannot have same handle).
- Immutable (users cannot change handle; prevents URL breakage).
- Makes URL routing simple: `GET /users/@john_doe` → lookup profile by handle.

**Example:**
- ✅ `/@john_doe` → fetch `SELECT * FROM profiles WHERE handle = 'john_doe'`.
- ❌ Without uniqueness, handle lookup would be ambiguous or slow.

---

## 4. Bookmark Structure: Title, URL, is_public

### Title
```sql
title TEXT NOT NULL
```

**Why:**
- Every bookmark needs a meaningful label.
- Can be auto-extracted from page metadata or user-provided.
- NOT NULL enforces data quality.

### URL
```sql
url TEXT NOT NULL
```

**Why:**
- Stored as plain TEXT (not validated in schema).
- Validation happens in application (length check, HTTP/HTTPS scheme, URL parsing).
- Denormalized approach: avoid storing parsed components in separate fields.

**Example:**
```
❌ Bad: url_scheme, url_domain, url_path (normalized but complex queries)
✅ Good: url (simple, validated in app)
```

### is_public Boolean
```sql
is_public BOOLEAN NOT NULL DEFAULT false
```

**Why:**
- **Denormalized Design**: Instead of querying a separate `bookmark_visibility` table.
- **Performance**: Boolean flag in main table enables efficient filtering without joins.
- **Privacy-First Default**: `DEFAULT false` ensures bookmarks are private by default.
- **Common Query**: "Show public bookmarks for user X" is optimized with composite index.

**Query Example:**
```sql
-- Without denormalization (slower):
SELECT b.* FROM bookmarks b
JOIN visibility v ON b.id = v.bookmark_id
WHERE b.user_id = ? AND v.is_public = true;

-- With denormalization (faster):
SELECT * FROM bookmarks WHERE user_id = ? AND is_public = true;
```

---

## 5. Foreign Key with CASCADE Delete

### Decision
```sql
FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE
```

### ON DELETE CASCADE Rationale
- **Data Integrity**: When a user deletes their account, all their bookmarks should be removed.
- **No Orphans**: Prevents orphaned bookmark records with invalid user_id.
- **Simplicity**: Application doesn't need to manually delete related bookmarks.

**Example:**
```sql
DELETE FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440000';
-- Automatically deletes all bookmarks where user_id matches
```

### ON UPDATE CASCADE Rationale
- **Consistency**: If a profile ID changes (rare with UUIDs), bookmarks update automatically.
- **Referential Integrity**: Maintains foreign key relationship always.

---

## 6. Index Strategy: Composite vs Single-Column

### Problem: Which Indexes to Create?

**Query Patterns:**
1. Get all bookmarks for a user: `SELECT * FROM bookmarks WHERE user_id = ?`
2. Get all public bookmarks globally: `SELECT * FROM bookmarks WHERE is_public = true`
3. Get public bookmarks for a user: `SELECT * FROM bookmarks WHERE user_id = ? AND is_public = true`
4. Get recent bookmarks: `SELECT * FROM bookmarks ORDER BY created_at DESC`
5. Get recent public bookmarks for a user: `SELECT * FROM bookmarks WHERE user_id = ? AND is_public = true ORDER BY created_at DESC LIMIT 20`

### Index Design

```sql
-- Single-column indexes (cover queries 1, 2, 4)
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_is_public ON bookmarks(is_public);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Composite indexes (optimize queries 3, 5)
CREATE INDEX idx_bookmarks_user_id_is_public ON bookmarks(user_id, is_public);
CREATE INDEX idx_bookmarks_user_public_created ON bookmarks(user_id, is_public, created_at DESC);
```

### Why Composite Indexes?

**Query 3 & 5 are Most Common:**
```sql
-- Query 5: Most complex and frequent
SELECT * FROM bookmarks 
WHERE user_id = ? AND is_public = true 
ORDER BY created_at DESC 
LIMIT 20;
```

**Composite Index Efficiency:**
```
Index: (user_id, is_public, created_at DESC)

Execution Plan:
1. Seek to all entries with user_id = ?
2. Filter to is_public = true (already sorted)
3. Return in created_at DESC order (index order)
4. Limit 20

All data is in index; no additional table scans needed.
```

### Index Selection Trade-offs

| Index | Queries Optimized | Storage Cost | Maintenance |
|-------|------------------|--------------|------------|
| Single column (user_id) | 1 | Low | Low |
| Single column (is_public) | 2 | Low | Low |
| Composite (user_id, is_public) | 3 | Medium | Medium |
| Composite (user_id, is_public, created_at) | 5 | Medium | Medium |

**Decision**: Create all indexes for balanced performance across all query patterns.

---

## 7. Timestamp Strategy: created_at Only

### Decision
Only `created_at`, no `updated_at` field.

### Rationale
- **Bookmarks are Immutable**: Once created, bookmarks don't change (title, URL, visibility are not editable in MVP).
- **No Update Overhead**: Saves storage and index maintenance.
- **Simple Audit Trail**: `created_at` provides all necessary temporal context.

### Future: If Edits Are Added
```sql
ALTER TABLE bookmarks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- Create index for sorting by recency of edits
CREATE INDEX idx_bookmarks_updated_at ON bookmarks(updated_at DESC);
```

---

## 8. Why No Search Fields in Schema?

### Current: Plain TEXT Columns
```sql
title TEXT NOT NULL
url TEXT NOT NULL
```

### Full-Text Search Deferred
Not implemented in schema; can be added as:

1. **PostgreSQL `tsvector` (Built-in FTS)**
   ```sql
   ALTER TABLE bookmarks ADD COLUMN search_vector tsvector;
   CREATE INDEX idx_bookmarks_search ON bookmarks USING GIN(search_vector);
   ```

2. **Supabase Vector Search** (for AI embeddings)
   ```sql
   ALTER TABLE bookmarks ADD COLUMN embedding vector(1536);
   CREATE INDEX idx_bookmarks_embedding ON bookmarks USING IVFFlat(embedding);
   ```

3. **Elasticsearch/Meilisearch** (separate search service)

**Rationale for Deferring**: Added complexity; simple keyword filtering (LIKE) sufficient for MVP.

---

## 9. Design Summary: Trade-offs Made

| Trade-off | Decision | Reason |
|-----------|----------|--------|
| **Denormalization (is_public)** | Include in bookmarks table | Query performance for common case |
| **Immutability (no updated_at)** | Omit for MVP | Reduces storage; can add if needed |
| **Full-text search** | Defer to application layer | Complexity; LIKE queries sufficient initially |
| **User profile fields** | Minimal (email, handle) | Extensible; add bio, avatar, etc. later |
| **Bookmark fields** | No metadata (tags, categories) | Can add separate tables if needed |

---

## 10. Scalability Projections

### Expected Performance at Scale

| Metric | 1k Users | 100k Users | 1M Users |
|--------|----------|-----------|----------|
| profiles table size | ~50KB | ~5MB | ~50MB |
| bookmarks (5 per user) | ~250KB | ~25MB | ~250MB |
| Query time (user's bookmarks) | <1ms | <5ms | <20ms |
| Full table scan time | <10ms | <100ms | <500ms |

**With indexes**: All queries run sub-100ms at 1M users.

### When to Optimize Further

- **>10M bookmarks**: Consider partitioning by user_id.
- **>100k QPS**: Use read replicas and caching (Redis).
- **Full-text search**: Migrate title/url search to dedicated service.

---

## Conclusion

This schema prioritizes:
1. ✅ **Data Integrity**: Foreign keys, unique constraints.
2. ✅ **Performance**: Strategic indexes for common queries.
3. ✅ **Scalability**: UUIDs, denormalization where justified.
4. ✅ **Privacy**: Immutable handles, default-private bookmarks.
5. ✅ **Maintainability**: Simple structure, easy to extend.

