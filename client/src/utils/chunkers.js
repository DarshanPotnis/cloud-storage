const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

// Returns SHA-256 hash of a chunk as base64 (what S3 expects)
async function hashChunk(chunk) {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

export async function splitFile(file) {
  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < file.size) {
    const blob = file.slice(start, start + CHUNK_SIZE);
    const sha256 = await hashChunk(blob);
    chunks.push({ index, blob, sha256 });
    start += CHUNK_SIZE;
    index++;
  }

  return chunks;
}