-- ─── Blog Feature Migration ───────────────────────────────────────────────────
-- Separate schema for blogs — does NOT touch existing tables.

CREATE TABLE IF NOT EXISTS blogs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  slug          text        UNIQUE NOT NULL,
  content       text        NOT NULL,
  excerpt       text,
  type          text        NOT NULL DEFAULT 'general',
  tags          text[]      DEFAULT '{}',
  cover_emoji   text        DEFAULT '📝',
  author_id     text        NOT NULL,
  author_name   text        NOT NULL,
  author_email  text,
  status        text        NOT NULL DEFAULT 'pending',
  reject_reason text,
  views         integer     NOT NULL DEFAULT 0,
  read_time     integer     NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  published_at  timestamptz,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Constraints ────────────────────────────────────────────────────────────────
ALTER TABLE blogs
  ADD CONSTRAINT blogs_type_check
    CHECK (type IN ('interview_experience','aptitude_strategy','company_profile',
                    'communication_tips','success_story','resume_advice',
                    'off_campus','general'));

ALTER TABLE blogs
  ADD CONSTRAINT blogs_status_check
    CHECK (status IN ('pending','published','rejected'));

ALTER TABLE blogs
  ADD CONSTRAINT blogs_content_min_length
    CHECK (char_length(content) >= 500);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS blogs_status_idx      ON blogs (status);
CREATE INDEX IF NOT EXISTS blogs_author_id_idx   ON blogs (author_id);
CREATE INDEX IF NOT EXISTS blogs_type_idx        ON blogs (type);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON blogs (published_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public: read published posts
CREATE POLICY "blogs_read_published"
  ON blogs FOR SELECT
  USING (status = 'published');

-- Authenticated users: insert their own posts
CREATE POLICY "blogs_user_insert"
  ON blogs FOR INSERT
  WITH CHECK (true);

-- Authors: read own posts (all statuses) via anon key (we pass author_id ourselves)
CREATE POLICY "blogs_read_own"
  ON blogs FOR SELECT
  USING (true);   -- JS layer filters by author_id; full RLS would need JWT claim

-- Authors: update own pending posts
CREATE POLICY "blogs_author_update"
  ON blogs FOR UPDATE
  USING (true);   -- Frontend restricts to own + pending

-- Admin: full access (password auth on frontend, anon key on backend)
CREATE POLICY "blogs_admin_delete"
  ON blogs FOR DELETE
  USING (true);

-- ── updated_at auto-trigger ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_blogs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION set_blogs_updated_at();

-- ── Atomic view counter ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE blogs SET views = views + 1 WHERE id = blog_id;
$$;
