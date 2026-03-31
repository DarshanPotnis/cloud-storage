import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function FileList({ token, refresh }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [refresh]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(data);
    } catch (err) {
      console.error('Failed to fetch files:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(fileId, filename) {
    try {
      const { data } = await axios.get(`${API}/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(data.url, '_blank');
    } catch (err) {
      alert('Download failed');
    }
  }

  async function handleDelete(fileId) {
    if (!confirm('Delete this file?')) return;
    try {
      await axios.delete(`${API}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      alert('Delete failed');
    }
  }

  function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) return <p style={styles.muted}>Loading files...</p>;
  if (files.length === 0) return <p style={styles.muted}>No files yet. Upload something above!</p>;

  return (
    <div>
      <h2 style={styles.heading}>Your Files</h2>
      <div style={styles.list}>
        {files.map(file => (
          <div key={file.id} style={styles.item}>
            <div style={styles.info}>
              <p style={styles.filename}>{file.filename}</p>
              <p style={styles.meta}>{formatSize(file.size_bytes)} · {new Date(file.created_at).toLocaleDateString()}</p>
            </div>
            <div style={styles.actions}>
              <button style={styles.downloadBtn} onClick={() => handleDownload(file.id, file.filename)}>↓ Download</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(file.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  heading: { color: '#e2e8f0', marginBottom: '1rem', fontSize: '1.1rem' },
  muted: { color: '#475569', textAlign: 'center', padding: '2rem 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  item: { background: '#1e293b', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  filename: { color: '#e2e8f0', margin: '0 0 0.25rem', fontSize: '0.95rem' },
  meta: { color: '#475569', margin: 0, fontSize: '0.8rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  downloadBtn: { padding: '0.4rem 0.8rem', background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  deleteBtn: { padding: '0.4rem 0.6rem', background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
};
