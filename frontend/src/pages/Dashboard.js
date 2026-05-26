import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Upload, FolderOpen, Users, Building2 } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import FileIcon from '../components/common/FileIcon';
import { useAuth } from '../context/AuthContext';
import { filesAPI, departmentsAPI } from '../services/api';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <div className="stat-value">{value ?? <span className="skeleton" style={{ width: 60, height: 32, display: 'inline-block' }} />}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ total: null, mine: null, shared: null, depts: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [filesRes, deptsRes] = await Promise.all([
          filesAPI.list({ limit: 10 }),
          departmentsAPI.list(),
        ]);
        const allFiles = filesRes.data?.files || [];
        setFiles(allFiles.slice(0, 10));
        setStats({
          total: filesRes.data?.total ?? allFiles.length,
          mine: allFiles.filter(f => f.uploadedBy === user?.userId).length,
          shared: allFiles.filter(f => f.shared).length,
          depts: deptsRes.data?.departments?.length ?? 0,
        });
      } catch {
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageLayout title="Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h2 className="page-title">
          {greeting()}, {user?.name || 'User'} 👋
        </h2>
        <p className="page-subtitle">
          Here's an overview of your department's file activity.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard icon={FolderOpen} label="Total Files" value={stats.total} color="var(--primary)" />
        <StatCard icon={Upload} label="My Uploads" value={stats.mine} color="var(--success)" />
        <StatCard icon={Users} label="Shared With Me" value={stats.shared} color="var(--accent)" />
        <StatCard icon={Building2} label="Departments" value={stats.depts} color="var(--warning)" />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Files</h3>
          {['StaffMember', 'DepartmentAdmin', 'SystemAdmin'].includes(role) && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>
              <Upload size={14} /> Upload
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={40} />
            <p>No files yet. Upload your first document.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr key={file.documentId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileIcon fileName={file.fileName} />
                        <span style={{ fontWeight: 500 }}>{file.fileName}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{file.category}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{file.uploadedByEmail || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {file.uploadedAt ? format(new Date(file.uploadedAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Dashboard;
