-- Store Google OAuth refresh token per expert (for creating Meet spaces)
ALTER TABLE experts ADD COLUMN IF NOT EXISTS google_refresh_token text;
