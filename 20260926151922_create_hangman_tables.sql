/*
# Create Hangman game tables (single-tenant, no auth)

1. New Tables
- `hangman_words`
  - `id` (uuid, primary key)
  - `word` (text, not null) — the word to guess, stored lowercase
  - `category` (text, not null) — category label (animals, countries, food, movies, tech)
  - `difficulty` (text, not null, default 'medium') — easy / medium / hard
  - `created_at` (timestamptz, default now())
- `hangman_results`
  - `id` (uuid, primary key)
  - `word` (text, not null) — the word that was played
  - `category` (text, not null)
  - `won` (boolean, not null) — true if the player won
  - `wrong_guesses` (int, not null) — number of wrong guesses made
  - `hints_used` (int, not null, default 0)
  - `player_name` (text, nullable) — optional name for leaderboard
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both tables because the data is intentionally shared/public (no sign-in screen).

3. Notes
- `hangman_words` holds the word bank so words can be managed without touching the app.
- `hangman_results` stores each game's outcome for stats and leaderboard.
- Indexes added on `category` and `created_at` for query performance.
*/

CREATE TABLE IF NOT EXISTS hangman_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hangman_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  category text NOT NULL,
  won boolean NOT NULL,
  wrong_guesses int NOT NULL,
  hints_used int NOT NULL DEFAULT 0,
  player_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hangman_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE hangman_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_words" ON hangman_words;
CREATE POLICY "anon_select_words" ON hangman_words FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_words" ON hangman_words;
CREATE POLICY "anon_insert_words" ON hangman_words FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_words" ON hangman_words;
CREATE POLICY "anon_update_words" ON hangman_words FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_words" ON hangman_words;
CREATE POLICY "anon_delete_words" ON hangman_words FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_results" ON hangman_results;
CREATE POLICY "anon_select_results" ON hangman_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_results" ON hangman_results;
CREATE POLICY "anon_insert_results" ON hangman_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_results" ON hangman_results;
CREATE POLICY "anon_update_results" ON hangman_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_results" ON hangman_results;
CREATE POLICY "anon_delete_results" ON hangman_results FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hangman_words_category ON hangman_words(category);
CREATE INDEX IF NOT EXISTS idx_hangman_results_created_at ON hangman_results(created_at DESC);