import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { auditAPI } from '../services/api';

const ACTIONS = ['All', 'UPLOAD_INITIATED', 'DOWNLOAD', 'DELETE', 'SHARE'];
const ACTION_BADGE = {
  UPLOAD_INITIATED: 'badge-green',
  DOWNLOAD: 'badge-blue',
  DELETE: 'badge-red',
  SHARE: 'badge-orange',
};

const PAGE_SIZE = 10;

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE };
      if (action !== 'All') params.action = action;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await auditAPI.list(params);
      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadLogs(); }, [action, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportCSV() {
    const header = 'Timestamp,User,Action,File,Department,IP\n';
    const rows = logs.map(l =>
      [l.timestamp, l.userEmail, l.action, l.fileName, l.department, l.ipAddress || ''].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageLayout title="Audit Log">
      <div className="page-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h2 className="page-title">Audit Log</h2>
          <p className="page-subtitle">Track all file actions in your department.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV} style={{ flexShrink: 0 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="input" value={action} onChange={e => { setAction(e.target.value); setPage(1); }} style={{ maxWidth: 220 }}>
          {ACTIONS.map(a => <option key={a}>{a}</option>)}
        </select>
        <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ maxWidth: 160 }} title="Start date" />
        <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ maxWidth: 160 }} title="End date" />
        <button className="btn btn-secondary btn-sm" onClick={() => { setAction('All'); setStartDate(''); setEndDate(''); setPage(1); }}>
          Clear
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <ClipboardList size={40} />
            <p>No audit entries found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th className="hide-mobile">User</th>
                  <th>Action</th>
                  <th>File</th>
                  <th className="hide-mobile">Department</th>
                  <th className="hide-mobile">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.logId}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp ? format(new Date(log.timestamp), 'dd MMM yy HH:mm') : '—'}
                    </td>
                    <td className="hide-mobile" style={{ fontSize: '0.82rem' }}>{log.userEmail || '—'}</td>
                    <td>
                      <span className={`badge ${ACTION_BADGE[log.action] || 'badge-grey'}`} style={{ fontSize: '0.68rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.fileName || '—'}
                    </td>
                    <td className="hide-mobile" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{log.department || '—'}</td>
                    <td className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

export default AuditLog;
