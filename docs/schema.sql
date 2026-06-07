-- ============================================================================
-- Bookmark App Database Schema
-- PostgreSQL / Supabase
-- ============================================================================
-- This schema defines the core tables and relationships for the bookmark app.
-- Created: 2026-06-07
-- ============================================================================

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Stores user profile information, extending Supabase Auth with additional fields.
-- Foreign key to auth.users is established at the application level.
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  handle TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraints
ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_email UNIQUE (email);

ALTER TABLE profiles
ADD CONSTRAINT uk_profiles_handle UNIQUE (handle);

-- Indexes on profiles table
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);

-- ============================================================================
-- TABLE: bookmarks
-- ============================================================================
-- Stores individual bookmarks created by users.
-- Each bookmark has a visibility setting (is_public) for sharing.
-- Foreign key to profiles enforces data integrity.
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT fk_bookmarks_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Indexes on bookmarks table
-- Primary lookup: get all bookmarks for a user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- Public bookmark discovery
CREATE INDEX IF NOT EXISTS idx_bookmarks_is_public ON bookmarks(is_public);

-- Combined: find all public bookmarks for a specific user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id_is_public ON bookmarks(user_id, is_public);

-- Temporal queries: sort bookmarks by creation date
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Combined: most complex query - user's public bookmarks sorted by recency
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_public_created 
  ON bookmarks(user_id, is_public, created_at DESC);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

