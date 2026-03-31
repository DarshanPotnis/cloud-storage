import { useState } from 'react';
import AuthForm from './components/AuthForm';
import FileUploader from './components/FileUploader';
import FileList from './components/FileList';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [refresh, setRefresh] = useState(0);

  function handleLogin(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  if (!token) return <AuthForm onLogin={handleLogin} />;

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>☁️ CloudStore</h1>
            <p style={styles.subtitle}>Welcome, {user?.email}</p>
          </div>
          <button style={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
        <div style={styles.stats}>
          <div style={styles.stat}><span style={styles.statNum}>~65%</span><span style={styles.statLabel}>bandwidth saved</span></div>
          <div style={styles.stat}><span style={styles.statNum}>500MB</span><span style={styles.statLabel}>max file size</span></div>
          <div style={styles.stat}><span style={styles.statNum}>SHA-256</span><span style={styles.statLabel}>integrity checks</span></div>
          <div style={styles.stat}><span style={styles.statNum}>&lt;20ms</span><span style={styles.statLabel}>RBAC queries</span></div>
        </div>
        <FileUploader token={token} onUploadComplete={() => setRefresh(r => r + 1)} />
        <FileList token={token} refresh={refresh} />
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', padding: '2rem 1rem' },
  inner: { maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { color: '#38bdf8', margin: '0 0 0.25rem', fontSize: '1.8rem' },
  subtitle: { color: '#64748b', margin: 0, fontSize: '0.9rem' },
  logout: { padding: '0.5rem 1rem', background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  stat: { background: '#1e293b', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' },
  statNum: { color: '#38bdf8', fontSize: '1.3rem', fontWeight: 'bold' },
  statLabel: { color: '#475569', fontSize: '0.75rem', textAlign: 'center' }
};
