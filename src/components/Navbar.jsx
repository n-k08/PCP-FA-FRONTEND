import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <nav data-testid="navbar" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '60px',
      background: '#ffffff',
      boxShadow: '0 1px 8px rgba(15,23,42,0.08)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '-0.5px' }}>
          BugTracker
        </span>
        <span style={{ fontSize: '0.7rem', background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: '999px', marginLeft: 4 }}>
          SET B
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {[
          { to: '/dashboard', label: 'Dashboard', testid: 'dashboard-link' },
          { to: '/users',     label: 'Users',     testid: 'users-link' },
          { to: '/projects',  label: 'Projects',  testid: 'projects-link' },
          { to: '/issues',    label: 'Issues',    testid: 'issues-link' },
          { to: '/comments',  label: 'Comments',  testid: 'comments-link' },
        ].map(({ to, label, testid }) => (
          <NavLink key={to} to={to} data-testid={testid}
            style={({ isActive }) => ({
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#4b5563',
              background: isActive ? 'rgba(99,102,241,0.5)' : 'transparent',
              transition: 'all 0.2s'
            })}>
            {label}
          </NavLink>
        ))}

        {state.isAuthenticated && (
          <button data-testid="logout-btn" onClick={handleLogout} style={{
            marginLeft: '1rem',
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68,0.4)',
            background: '#fef2f2',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
