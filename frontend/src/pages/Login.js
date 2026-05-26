import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, confirmSignIn } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Login() {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'new-password'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: form.email, password: form.password });
      if (isSignedIn) {
        await checkAuth();
        navigate('/');
      } else if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep('new-password');
      } else {
        setError('Unexpected sign-in state: ' + (nextStep?.signInStep || 'unknown'));
      }
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleNewPassword(e) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      await checkAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to set new password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
      padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>EK</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>
            Welcome back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            EKSU Departmental File System
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 'login' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Email address</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@eksu.edu.ng"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPassword}>
            <div className="alert alert-success" style={{ marginBottom: 16 }}>
              This is your first login. Please set a permanent password.
            </div>
            <div className="form-group">
              <label className="input-label">New Password</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                placeholder="Min. 8 chars, uppercase, number"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="input-label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={confirmNewPassword}
                onChange={e => { setConfirmNewPassword(e.target.value); setError(''); }}
                placeholder="Repeat new password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Setting password…' : 'Set Password & Sign In'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
