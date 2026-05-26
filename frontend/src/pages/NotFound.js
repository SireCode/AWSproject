import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', textAlign: 'center', padding: 24,
    }}>
      <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>404</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Page not found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        The page you're looking for doesn't exist.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <Home size={16} /> Go Home
      </button>
    </div>
  );
}

export default NotFound;
