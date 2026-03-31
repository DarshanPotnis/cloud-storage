import { useState } from 'react';
import axios from 'axios';
import { splitFile } from '../utils/chunker';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');

  async function upload(file, token) {
    setStatus('uploading');
    setProgress(0);

    const chunks = await splitFile(file);

    const { data: { fileId, s3Key } } = await axios.post(`${API}/upload/init`, {
      filename: file.name,
      totalChunks: chunks.length,
      fileSize: file.size
    }, { headers: { Authorization: `Bearer ${token}` } });

    const completedChunks = [];

    for (const chunk of chunks) {
      try {
        const { data: { url } } = await axios.post(`${API}/upload/presign`, {
          s3Key,
          chunkIndex: chunk.index,
          sha256: chunk.sha256
        }, { headers: { Authorization: `Bearer ${token}` } });

        const response = await axios.put(url, chunk.blob, {
          headers: { 'Content-Type': 'application/octet-stream' }
        });

        const etag = response.headers.etag || `etag-${chunk.index}`;
        completedChunks.push({ index: chunk.index, etag, sha256: chunk.sha256 });
        setProgress(Math.round(((chunk.index + 1) / chunks.length) * 100));

      } catch (err) {
        console.error(`Chunk ${chunk.index} failed:`, err.message);
        setStatus('error');
        return;
      }
    }

    await axios.post(`${API}/upload/complete`, {
      fileId,
      chunks: completedChunks
    }, { headers: { Authorization: `Bearer ${token}` } });

    setStatus('done');
    setProgress(100);
  }

  function reset() {
    setProgress(0);
    setStatus('idle');
  }

  return { upload, progress, status, reset };
}
