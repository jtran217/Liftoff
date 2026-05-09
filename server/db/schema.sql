CREATE TABLE IF NOT EXISTS questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL,
  lp_tag      TEXT,
  text        TEXT NOT NULL,
  difficulty  INTEGER DEFAULT 1,
  is_custom   BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id   INTEGER REFERENCES questions(id),
  type          TEXT NOT NULL,
  recorded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  audio_path    TEXT NOT NULL,
  video_path    TEXT,
  transcript    TEXT,
  duration_secs REAL,
  topic         TEXT,
  self_rating   INTEGER,
  notes         TEXT,
  bookmarked    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ai_reviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id       INTEGER NOT NULL REFERENCES sessions(id),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  star_feedback    TEXT,
  filler_words     TEXT,
  wpm              INTEGER,
  clarity_score    INTEGER,
  structure_score  INTEGER,
  confidence_score INTEGER,
  ai_notes         TEXT,
  full_response    TEXT
);

CREATE TABLE IF NOT EXISTS comparisons (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  session_a        INTEGER NOT NULL REFERENCES sessions(id),
  session_b        INTEGER NOT NULL REFERENCES sessions(id),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  ai_delta_summary TEXT
);

CREATE TABLE IF NOT EXISTS drill_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_type TEXT NOT NULL,
  completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_secs REAL,
  audio_path    TEXT
);
