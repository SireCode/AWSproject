import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserCog } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usersAPI, departmentsAPI } from '../services/api';

const ROLES = ['Viewer', 'StaffMember', 'DepartmentAdmin', 'SystemAdmin'];
const ROLE_BADGE = { SystemAdmin: 'badge-orange', DepartmentAdmin: 'badge-purple', StaffMember: 'badge-green', Viewer: 'badge-grey' };

function AdminPanel() {
  const { role } = useAuth();
  const [tab, setTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [deptSaving, setDeptSaving] = useState(false);

  useEffect(() => {
    loadUsers();
    loadDepts();
  }, []);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const res = await usersAPI.list();
      setUsers(res.data?.users || []);
    } catch { setUsers([]); }
    finally { setUsersLoading(false); }
  }

  async function loadDepts() {
    setDeptsLoading(true);
    try {
      const res = await departmentsAPI.list();
      setDepartments(res.data?.departments || []);
    } catch { setDepartments([]); }
    finally { setDeptsLoading(false); }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await usersAPI.updateRole(userId, newRole);
      toast.success('Role updated.');
      loadUsers();
    } catch { toast.error('Failed to update role.'); }
  }

  async function handleRemoveUser(userId) {
    if (!window.confirm('Remove this user?')) return;
    try {
      await usersAPI.delete(userId);
      toast.success('User removed.');
      loadUsers();
    } catch { toast.error('Failed to remove user.'); }
  }

  async function handleAddDept(e) {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    setDeptSaving(true);
    try {
      await departmentsAPI.create(newDept);
      toast.success('Department created.');
      setNewDept({ name: '', description: '' });
      loadDepts();
    } catch { toast.error('Failed to create department.'); }
    finally { setDeptSaving(false); }
  }

  async function handleDeleteDept(id) {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentsAPI.delete(id);
      toast.success('Department deleted.');
      loadDepts();
    } catch { toast.error('Failed to delete department.'); }
  }

  return (
    <PageLayout title="Admin Panel">
      <h2 className="page-title">Admin Panel</h2>
      <p className="page-subtitle">Manage users and departments.</p>

      <div className="tabs">
        <div className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</div>
        <div className={`tab ${tab === 'departments' ? 'active' : ''}`} onClick={() => setTab('departments')}>Departments</div>
      </div>

      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {usersLoading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><LoadingSpinner /></div>
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}><p>No users found.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.userId}>
                      <td style={{ fontWeight: 500 }}>{u.email}</td>
                      <td>{u.department || '—'}</td>
                      <td>
                        <span className={`badge ${ROLE_BADGE[u.role] || 'badge-grey'}`}>{u.role}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.createdAt ? u.createdAt.slice(0, 10) : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {role === 'SystemAdmin' && (
                            <>
                              <select
                                className="input"
                                style={{ width: 'auto', fontSize: '0.8rem', padding: '4px 8px', height: 32 }}
                                value={u.role}
                                onChange={e => handleRoleChange(u.userId, e.target.value)}
                              >
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                              </select>
                              <button className="btn btn-danger btn-sm" onClick={() => handleRemoveUser(u.userId)}>
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'departments' && (
        <div>
          {role === 'SystemAdmin' && (
            <form onSubmit={handleAddDept} className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add Department</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label className="input-label">Name</label>
                  <input className="input" placeholder="e.g. Physics" value={newDept.name} onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="input-label">Description (optional)</label>
                  <input className="input" placeholder="Brief description" value={newDept.description} onChange={e => setNewDept(p => ({ ...p, description: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={deptSaving}>
                  {deptSaving ? <LoadingSpinner size="sm" /> : <Plus size={15} />}
                  Add
                </button>
              </div>
            </form>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {deptsLoading ? (
              <div style={{ padding: 48, textAlign: 'center' }}><LoadingSpinner /></div>
            ) : departments.length === 0 ? (
              <div className="empty-state" style={{ padding: 48 }}><p>No departments found.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {departments.map(d => (
                      <tr key={d.departmentId}>
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{d.description || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{d.createdAt?.slice(0, 10) || '—'}</td>
                        <td>
                          {role === 'SystemAdmin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDept(d.departmentId)}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default AdminPanel;
