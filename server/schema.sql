-- SpeakScore AI — relational schema (production target: PostgreSQL)
-- The client mirrors this schema in IndexedDB (database: speakscore_ai).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role_track    TEXT NOT NULL DEFAULT 'Software Engineer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track          TEXT NOT NULL CHECK (track IN ('Technical', 'HR')),
  role           TEXT NOT NULL,
  difficulty     TEXT NOT NULL DEFAULT 'Intermediate',
  question_count INT  NOT NULL,
  duration_sec   INT  NOT NULL,
  word_count     INT  NOT NULL,
  relevance      INT  NOT NULL,
  keywords       INT  NOT NULL,
  clarity        INT  NOT NULL,
  pace           INT  NOT NULL,
  filler_score   INT  NOT NULL,
  confidence     INT  NOT NULL,
  overall        INT  NOT NULL,
  wpm            INT  NOT NULL,
  fillers_per_min NUMERIC(4,1) NOT NULL,
  filler_count   INT  NOT NULL,
  pause_count    INT  NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS answers (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  question_text   TEXT NOT NULL,
  transcript      TEXT NOT NULL,
  word_count      INT  NOT NULL,
  duration_sec    INT  NOT NULL,
  wpm             INT  NOT NULL,
  relevance       INT  NOT NULL,
  keyword_coverage INT NOT NULL,
  filler_count    INT  NOT NULL,
  fillers_per_min NUMERIC(4,1) NOT NULL,
  clarity         INT  NOT NULL,
  overall         INT  NOT NULL,
  keywords_hit    JSONB NOT NULL DEFAULT '[]',
  keywords_missed JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
