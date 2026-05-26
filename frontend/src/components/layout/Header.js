import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header({ title, onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/documents?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <header
      className="page-header"
      style={{
        height: 'var(--header-height)',
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 'var(--sidebar-width)',
        right: 0,
        zIndex: 90,
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
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
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <form onSubmit={handleSearch} className="header-search" style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            placeholder="Search files…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 32, width: 220, fontSize: '0.82rem', height: 36 }}
          />
        </form>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
