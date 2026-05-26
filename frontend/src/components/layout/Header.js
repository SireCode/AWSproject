import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Header({ title }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: 'var(--header-height)',
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      zIndex: 90,
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    }}>
      <div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          {title}
        </h1>
        {user?.department && (
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            background: '#f1f5f9',
            padding: '2px 8px',
            borderRadius: 99,
            marginTop: 2,
            display: 'inline-block',
          }}>
            {user.department}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="Search files…"
            style={{ paddingLeft: 32, width: 220, fontSize: '0.82rem', height: 36 }}
            readOnly
          />
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
