import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, X, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import FileIcon from '../components/common/FileIcon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { uploadFileToS3 } from '../services/fileUpload';

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

const CATEGORIES = ['Academic', 'Administrative', 'Research', 'Financial', 'Correspondence', 'Other'];
const ACCESS_LEVELS = ['Department Only', 'Staff Only', 'Admin Only'];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function Upload() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [meta, setMeta] = useState({ category: 'Academic', description: '', accessLevel: 'Department Only' });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [, setDone] = useState(false);

  const onDrop = useCallback(accepted => {
    setFiles(prev => [...prev, ...accepted]);
    setDone(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: true,
  });

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (files.length === 0) { toast.error('Please select at least one file.'); return; }
    setUploading(true);
    setProgress(0);

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await uploadFileToS3(file, {
          ...meta,
          department: user?.department || 'Unknown',
        }, (pct) => {
          setProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });
        successCount++;
      } catch (err) {
        toast.error(`Failed to upload "${file.name}"`);
      }
    }

    setUploading(false);
    setProgress(100);
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!`);
      setDone(true);
      setFiles([]);
      setProgress(0);
    }
  }

  return (
    <PageLayout title="Upload">
      <h2 className="page-title">Upload Documents</h2>
      <p className="page-subtitle">Upload files to your department's document library.</p>

      <div style={{ maxWidth: 680 }}>
        {/* Drop zone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '40px 24px',
            textAlign: 'center',
            background: isDragActive ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.15s',
            marginBottom: 20,
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload size={40} color={isDragActive ? 'var(--primary)' : '#94a3b8'} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontWeight: 600, color: isDragActive ? 'var(--primary)' : 'var(--text)' }}>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
            or click to browse — PDF, Word, Excel, PowerPoint, Images — max 50 MB each
          </p>
        </div>

        {fileRejections.length > 0 && (
          <div className="alert alert-error">
            {fileRejections[0].errors[0].message}
          </div>
        )}

        {/* Selected files */}
        {files.length > 0 && (
          <div className="card" style={{ marginBottom: 20, padding: 16 }}>
            {files.map((file, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < files.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <FileIcon fileName={file.name} />
                <span style={{ flex: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <form onSubmit={handleUpload} className="card">
          <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Category</label>
              <select className="input" value={meta.category} onChange={e => setMeta(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Access Level</label>
              <select className="input" value={meta.accessLevel} onChange={e => setMeta(p => ({ ...p, accessLevel: e.target.value }))}>
                {ACCESS_LEVELS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Description (optional)</label>
            <input className="input" value={meta.description} onChange={e => setMeta(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the document…" />
          </div>

          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={uploading || files.length === 0}>
            {uploading ? <LoadingSpinner size="sm" /> : <FileCheck size={16} />}
            {uploading ? 'Uploading…' : `Upload ${files.length > 0 ? files.length + ' ' : ''}File${files.length !== 1 ? 's' : ''}`}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}

export default Upload;
