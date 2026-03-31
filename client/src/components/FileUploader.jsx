import { useState, useRef } from 'react';
import { useUpload } from '../hooks/useUpload';

export default function FileUploader({ token, onUploadComplete }) {
  const { upload, progress, status, reset } = useUpload();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    await upload(file, token);
    if (status !== 'error') {
      setTimeout(() => {
        reset();
        onUploadComplete();
      }, 1500);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div style={styles.container}>
      <div
        style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        {status === 'idle' && <p style={styles.dropText}>📁 Drop a file here or click to upload<br/><span style={styles.hint}>Up to 500MB — chunked with SHA-256 integrity</span></p>}
        {status === 'uploading' && (
          <div style={styles.progressContainer}>
            <p style={styles.progressText}>Uploading... {progress}%</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.hint}>Chunks uploading directly to S3 ⚡</p>
          </div>
        )}
        {status === 'done' && <p style={styles.success}>✅ Upload complete!</p>}
        {status === 'error' && <p style={styles.error}>❌ Upload failed — try again</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { marginBottom: '2rem' },
  dropzone: { border: '2px dashed #334155', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  dropzoneActive: { border: '2px dashed #38bdf8', background: 'rgba(56,189,248,0.05)' },
  dropText: { color: '#94a3b8', margin: 0, fontSize: '1rem', lineHeight: '1.8' },
  hint: { color: '#475569', fontSize: '0.8rem' },
  progressContainer: { width: '100%' },
  progressText: { color: '#38bdf8', marginBottom: '1rem' },
  progressBar: { background: '#1e293b', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '0.5rem' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: '999px', transition: 'width 0.3s ease' },
  success: { color: '#4ade80', fontSize: '1.2rem', margin: 0 },
  error: { color: '#f87171', fontSize: '1.2rem', margin: 0 }
};
