import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../services/api';

export default function Login() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.data });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#ffffff',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', margin: '1rem',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 24px 60px rgba(15,23,42,0.12)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: '800', margin: 0,
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>BugTracker</h1>
          <p style={{ color: '#4b5563', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Issue & Bug Tracking System
          </p>
        </div>

        <form data-testid="login-form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              data-testid="email-input"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '10px', color: '#111827',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>
              Password
            </label>
            <input
              data-testid="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '10px', color: '#111827',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem', padding: '0.75rem 1rem',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            data-testid="login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontSize: '1rem', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
