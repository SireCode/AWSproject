import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Upload, ShieldCheck,
  ClipboardList, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, roles: null },
  { to: '/documents', label: 'Documents', Icon: FolderOpen, roles: null },
  { to: '/upload', label: 'Upload', Icon: Upload, roles: ['StaffMember', 'DepartmentAdmin', 'SystemAdmin'] },
  { to: '/admin', label: 'Admin Panel', Icon: ShieldCheck, roles: ['DepartmentAdmin', 'SystemAdmin'] },
  { to: '/audit', label: 'Audit Log', Icon: ClipboardList, roles: ['DepartmentAdmin', 'SystemAdmin'] },
];

const ROLE_COLORS = {
  SystemAdmin: '#f97316',
  DepartmentAdmin: '#8b5cf6',
  StaffMember: '#10b981',
  Viewer: '#64748b',
};

function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--dark)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          EKSU CBDFS
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
          Departmental File System
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV.map(({ to, label, Icon, roles: allowed }) => {
          if (allowed && !allowed.includes(role)) return null;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 6,
                marginBottom: 4,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(37,99,235,.5)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{ padding: '16px 16px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: ROLE_COLORS[role] || '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{
                background: ROLE_COLORS[role] || '#64748b',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 99,
              }}>
                {role}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', background: 'rgba(255,255,255,.06)', color: '#94a3b8', border: 'none' }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
