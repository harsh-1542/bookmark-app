# Bookmark App Database Schema

## Design Overview

This document outlines the database schema for the bookmark application, including table definitions, relationships, indexes, and design rationale.

---

## Table: `profiles`

### Purpose

Stores user profile information. Acts as the primary user record extending Supabase Auth.

### Columns

| Column       | Type                       | Constraints               | Description                                                 |
| ------------ | -------------------------- | ------------------------- | ----------------------------------------------------------- |
| `id`         | `UUID`                     | PRIMARY KEY               | Unique identifier, matches `auth.users.id`                  |
| `email`      | `TEXT`                     | NOT NULL, UNIQUE          | User email address for contact and reference                |
| `handle`     | `TEXT`                     | NOT NULL, UNIQUE          | Unique username/handle for profile URLs (e.g., `@username`) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT `now()` | Account creation timestamp                                  |

### Design Decisions

1. **UUID Primary Key**: Uses UUID instead of SERIAL for scalability and privacy (no sequential user IDs exposed).
2. **Email Uniqueness**: Enforced at DB level; matches Supabase Auth email uniqueness.
3. **Handle Uniqueness**: Users can share profiles via `example.com/@handle`. Must be globally unique and immutable.
4. **Timestamp**: Uses `TIMESTAMP WITH TIME ZONE` for timezone-aware logging across regions.

---

## Table: `bookmarks`

### Purpose

Stores individual bookmarks created by users, with visibility control.

### Columns

| Column       | Type                       | Constraints               | Description                                            |
| ------------ | -------------------------- | ------------------------- | ------------------------------------------------------ |
| `id`         | `UUID`                     | PRIMARY KEY               | Unique bookmark identifier                             |
| `user_id`    | `UUID`                     | NOT NULL, FOREIGN KEY     | References `profiles.id`                               |
| `title`      | `TEXT`                     | NOT NULL                  | Bookmark title (user-provided or auto-extracted)       |
| `url`        | `TEXT`                     | NOT NULL                  | Bookmark URL (stored with scheme, e.g., `https://...`) |
| `is_public`  | `BOOLEAN`                  | NOT NULL, DEFAULT `false` | Visibility flag: public bookmarks shown on profile     |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | NOT NULL, DEFAULT `now()` | Bookmark creation timestamp                            |

### Design Decisions

1. **UUID Primary Key**: Consistent with profiles table for consistency and scalability.
2. **Foreign Key**: `user_id` references `profiles.id` with cascade delete for data integrity.
3. **Title Not Null**: Every bookmark must have a title for meaningful display.
4. **URL Storage**: Stored as plain TEXT (normalized and validated in application layer).
5. **is_public Boolean**: Denormalized flag for efficient filtering without joins (common query pattern).
6. **Default is_public=false**: Privacy-first approach; users must explicitly publish bookmarks.
7. **No Duplicate Prevention**: Same URL can be bookmarked multiple times (intentional; users may want different titles/organization).

---

## Foreign Key Relationships

```
profiles (primary)
    ↓ 1:N
bookmarks (dependent)
    user_id → profiles.id
```

### Cascade Behavior

- **ON DELETE CASCADE**: When a user is deleted, all their bookmarks are automatically deleted.
- **ON UPDATE CASCADE**: If a profile ID changes (unlikely with UUIDs, but follows best practice), bookmarks update accordingly.

---

## Index Recommendations

### Indexes for Query Performance

#### 1. **profiles Table**

```sql
-- Already covered by PRIMARY KEY
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_profiles_handle ON profiles(handle);
```

**Rationale:**

- `email` index: Speeds up authentication lookups (`SELECT * FROM profiles WHERE email = ?`).
- `handle` index: Enables fast profile URL resolution (`/user/@{handle}`).
- Both should be unique to prevent duplicates and serve as fast lookups.

#### 2. **bookmarks Table**

```sql
-- Foreign key lookup
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Public bookmark discovery
CREATE INDEX idx_bookmarks_is_public ON bookmarks(is_public);

-- Combined: Get all public bookmarks for a user
CREATE INDEX idx_bookmarks_user_id_is_public ON bookmarks(user_id, is_public);

-- Temporal queries
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Combined: Recent public bookmarks per user
CREATE INDEX idx_bookmarks_user_public_created ON bookmarks(user_id, is_public, created_at DESC);
```

**Rationale:**

- `user_id` index: Essential for `SELECT * FROM bookmarks WHERE user_id = ?` queries.
- `is_public` index: Speeds up global public bookmark discovery.
- `user_id, is_public` composite: Optimizes the common query: "Show all public bookmarks for user X."
- `created_at DESC` index: Supports sorting bookmarks by recency.
- `user_id, is_public, created_at DESC` composite: Optimizes the most complex query (user's public bookmarks, sorted by date).

**Index Strategy:** Composite indexes reduce table scans for multi-column WHERE clauses and ORDER BY operations.

---

## Unique Constraints

### Constraint: `profiles.handle`

```sql
ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_handle UNIQUE (handle);
```

**Rationale:**

- Ensures no two users have the same handle.
- Enables deterministic profile URL routes: `/@{handle}`.
- Case sensitivity: By default, PostgreSQL is case-sensitive. Consider adding case-insensitive collation if needed.

### Unique Constraints: `profiles.email`

```sql
ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_email UNIQUE (email);
```

**Rationale:**

- Prevents duplicate email registrations.
- Matches Supabase Auth uniqueness requirement.

---

## Scalability & Performance Considerations

### Current Design

- **Bookmarks per User**: Handles millions of bookmarks efficiently with indexed queries.
- **Public Bookmarks**: Filtered by `is_public` index; supports large-scale public feed discovery.
- **Temporal Queries**: `created_at` index supports pagination and time-range queries.

### Future Optimization (Not Implemented)

- **Full-Text Search**: Add GIN index on `title` and `url` for keyword search (use PostgreSQL `tsvector`).
- **Categories/Tags**: Separate table `bookmark_tags` with many-to-many relationship if needed.
- **Search Analytics**: Track popular bookmarks and trending URLs in separate analytics table.

---

## Data Integrity & Constraints

| Rule                                   | Implementation                                                    | Purpose                     |
| -------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| User must exist to create bookmark     | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` | Prevents orphaned bookmarks |
| Handle must be unique                  | `UNIQUE (handle)`                                                 | Enables deterministic URLs  |
| Email must be unique                   | `UNIQUE (email)`                                                  | Prevents account duplicates |
| Bookmark is_public defaults to private | `DEFAULT false`                                                   | Privacy-first design        |
| Timestamps are immutable               | Set at insert; not updated                                        | Audit trail for created_at  |

---

## Migration Strategy

### Phase 1: Schema Creation

1. Create `profiles` table.
2. Create `bookmarks` table with foreign key.
3. Create indexes.

### Phase 2: Integration with Supabase Auth

- `profiles.id` matches `auth.users.id` (manual sync via trigger or app logic).
- On user signup, insert corresponding profile record.

### Phase 3: Data Population (If Migrating)

- Bulk insert profiles and bookmarks.
- Verify referential integrity before going live.

---

## Security Considerations (Pre-RLS)

**Note:** Row Level Security (RLS) is intentionally omitted from this schema. RLS will be implemented separately in [SECURITY.md](./SECURITY.md).

Current schema assumes application-level access control:

- Application validates `user_id` before returning bookmarks.
- Public bookmarks (`is_public = true`) can be queried by any authenticated user.
- Private bookmarks require ownership verification in application code.

---

## Summary

| Aspect                  | Design                                         |
| ----------------------- | ---------------------------------------------- |
| **User Representation** | UUID-based profiles linked to Supabase Auth    |
| **Bookmark Storage**    | Denormalized `is_public` flag for performance  |
| **Relationships**       | 1:N (profiles → bookmarks) with cascade delete |
| **Uniqueness**          | Email and handle enforced globally             |
| **Indexes**             | 6 recommended indexes covering common queries  |
| **Scalability**         | Supports millions of users and bookmarks       |
| **Privacy Model**       | Opt-in public sharing; private by default      |
