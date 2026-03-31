CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  size_bytes BIGINT,
  sha256 TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chunk_manifest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  etag TEXT,         -- S3 returns this after each chunk uploads
  sha256 TEXT,       -- We verify this before committing
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(file_id, chunk_index)
);

-- Fast RBAC queries (that <20ms stat)
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_chunks_file ON chunk_manifest(file_id);