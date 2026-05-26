import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usersAPI, departmentsAPI } from '../services/api';

const ROLES = ['Viewer', 'StaffMember', 'DepartmentAdmin', 'SystemAdmin'];
const ROLE_BADGE = { SystemAdmin: 'badge-orange', DepartmentAdmin: 'badge-purple', StaffMember: 'badge-green', Viewer: 'badge-grey' };

const DEPARTMENTS = [
  'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Statistics',
  'Biology', 'Biochemistry', 'Geology', 'Economics', 'Accounting',
  'Business Administration', 'English', 'History', 'Other',
];

function AdminPanel() {
  const { role } = useAuth();
  const [tab, setTab] = useState('users');

  // Create user state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', department: '', role: 'StaffMember' });
  const [creating, setCreating] = useState(false);

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

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await usersAPI.create(newUser);
      toast.success(`Account created for ${newUser.email}. They will receive a temporary password by email.`);
      setNewUser({ fullName: '', email: '', department: '', role: 'StaffMember' });
      setShowCreateUser(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
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
        <div>
        {role === 'SystemAdmin' && (
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setShowCreateUser(v => !v)}>
              <UserPlus size={15} /> {showCreateUser ? 'Cancel' : 'Create User'}
            </button>
          </div>
        )}

        {showCreateUser && (
          <form onSubmit={handleCreateUser} className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New User Account</h3>
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name</label>
                <input className="input" placeholder="John Doe" required
                  value={newUser.fullName} onChange={e => setNewUser(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="user@eksu.edu.ng" required
                  value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Department</label>
                <select className="input" required value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Role</label>
                <select className="input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <LoadingSpinner size="sm" /> : <UserPlus size={15} />}
              {creating ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        )}

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
                    <th className="hide-mobile">Department</th>
                    <th>Role</th>
                    <th className="hide-mobile">Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.userId}>
                      <td style={{ fontWeight: 500, fontSize: '0.82rem' }}>{u.email}</td>
                      <td className="hide-mobile">{u.department || '—'}</td>
                      <td>
                        <span className={`badge ${ROLE_BADGE[u.role] || 'badge-grey'}`}>{u.role}</span>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{u.createdAt ? u.createdAt.slice(0, 10) : '—'}</td>
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
        </div>
      )}

      {tab === 'departments' && (
        <div>
          {role === 'SystemAdmin' && (
            <form onSubmit={handleAddDept} className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add Department</h3>
              <div className="dept-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'flex-end' }}>
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
