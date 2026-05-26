import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DEPARTMENTS = [
  'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Statistics',
  'Biology', 'Biochemistry', 'Geology', 'Economics', 'Accounting',
  'Business Administration', 'English', 'History', 'Other'
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [form, setForm] = useState({
    fullName: '', email: '', department: '', password: '', confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp({
        username: form.email,
        password: form.password,
        options: {
          userAttributes: {
            email: form.email,
            name: form.fullName,
            'custom:department': form.department,
          },
        },
      });
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmSignUp({ username: form.email, confirmationCode: code });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Verification failed. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
      padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>EK</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {step === 'register'
              ? 'EKSU Departmental File System'
              : `A verification code was sent to ${form.email}`}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input className="input" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@eksu.edu.ng" required />
            </div>
            <div className="form-group">
              <label className="input-label">Department</label>
              <select className="input" name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required />
            </div>
            <div className="form-group">
              <label className="input-label">Confirm Password</label>
              <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="input-label">Verification Code</label>
              <input
                className="input"
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                placeholder="Enter 6-digit code"
                required
                style={{ fontSize: '1.2rem', letterSpacing: 6, textAlign: 'center' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
