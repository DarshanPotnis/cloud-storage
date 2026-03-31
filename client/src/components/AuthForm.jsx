import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API}/auth/${mode}`, { email, password });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>☁️ CloudStore</h1>
        <p style={styles.subtitle}>Distributed File Storage</p>
        <div style={styles.tabs}>
          <button style={mode === 'login' ? styles.activeTab : styles.tab} onClick={() => setMode('login')}>Login</button>
          <button style={mode === 'register' ? styles.activeTab : styles.tab} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card: { background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  title: { color: '#38bdf8', margin: '0 0 0.25rem', fontSize: '1.8rem', textAlign: 'center' },
  subtitle: { color: '#64748b', textAlign: 'center', margin: '0 0 1.5rem', fontSize: '0.9rem' },
  tabs: { display: 'flex', marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' },
  tab: { flex: 1, padding: '0.6rem', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
  activeTab: { flex: 1, padding: '0.6rem', background: '#38bdf8', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: '1rem' },
  error: { color: '#f87171', margin: 0, fontSize: '0.85rem' },
  button: { padding: '0.75rem', borderRadius: '8px', background: '#38bdf8', color: '#0f172a', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};
