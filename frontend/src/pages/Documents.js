import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Trash2, Share2, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import FileIcon from '../components/common/FileIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../services/api';
import { uploadFileToS3 } from '../services/fileUpload';

const CATEGORIES = ['All', 'Academic', 'Administrative', 'Research', 'Financial', 'Correspondence', 'Other'];
const PAGE_SIZE = 10;

function Documents() {
  const { user, role } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadFiles() {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE };
      if (category !== 'All') params.category = category;
      const res = await filesAPI.list(params);
      setFiles(res.data?.files || []);
      setTotal(res.data?.total || 0);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFiles(); }, [category]);

  async function handleDownload(file) {
    try {
      const res = await filesAPI.getDownloadUrl(file.documentId);
      window.open(res.data.downloadUrl, '_blank');
    } catch {
      toast.error('Could not generate download link.');
    }
  }

  async function handleDelete(file) {
    if (!window.confirm(`Delete "${file.fileName}"? This cannot be undone.`)) return;
    try {
      await filesAPI.delete(file.documentId);
      toast.success('File deleted.');
      loadFiles();
    } catch {
      toast.error('Delete failed.');
    }
  }

  async function handleShare(file) {
    const target = window.prompt('Enter target department name:');
    if (!target) return;
    try {
      await filesAPI.share(file.documentId, { targetDepartment: target });
      toast.success('File shared successfully.');
    } catch {
      toast.error('Share failed.');
    }
  }

  const filtered = files.filter(f =>
    f.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageLayout title="Documents">
      <h2 className="page-title">Documents</h2>
      <p className="page-subtitle">Browse and manage files in your department.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Search files…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <select className="input" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ maxWidth: 200 }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <FolderOpen size={40} />
            <p>No documents found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(file => (
                  <tr key={file.documentId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileIcon fileName={file.fileName} />
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{file.fileName}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{file.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(1)} MB` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{file.uploadedByEmail || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {file.uploadedAt ? format(new Date(file.uploadedAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(file)} title="Download">
                          <Download size={13} />
                        </button>
                        {['StaffMember', 'DepartmentAdmin', 'SystemAdmin'].includes(role) && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleShare(file)} title="Share">
                            <Share2 size={13} />
                          </button>
                        )}
                        {['DepartmentAdmin', 'SystemAdmin'].includes(role) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(file)} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Documents;
