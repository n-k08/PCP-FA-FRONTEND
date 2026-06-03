import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import API from '../services/api';

const StatCard = ({ testid, label, value, color, icon }) => (
  <div data-testid={testid} style={{
    background: '#ffffff',
    border: `1px solid ${color}33`,
    borderRadius: '16px',
    padding: '1.5rem',
    flex: '1', minWidth: '160px',
    boxShadow: `0 4px 24px ${color}22`,
    transition: 'transform 0.2s',
    cursor: 'default'
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: '800', color }}>{value ?? '—'}</div>
    <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.25rem', fontWeight: '500' }}>{label}</div>
  </div>
);

const BarChart = ({ data, colors }) => {
  const max = Math.max(...Object.values(data || {}).filter(Boolean), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '140px', padding: '0 1rem' }}>
      {Object.entries(data || {}).map(([key, val], i) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: '700' }}>{val}</span>
          <div style={{
            width: '100%',
            height: `${Math.max((val / max) * 110, 6)}px`,
            background: colors[i % colors.length],
            borderRadius: '6px 6px 0 0',
            transition: 'height 0.5s ease',
            minHeight: '6px'
          }} />
          <span style={{ fontSize: '0.7rem', color: '#4b5563', textAlign: 'center', textTransform: 'capitalize' }}>{key}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const stats = state.stats;

  useEffect(() => {
    const fetchStats = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const res = await API.get('/stats');
        dispatch({ type: 'SET_STATS', payload: res.data.data });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load stats' });
      }
    };
    fetchStats();
  }, [dispatch]);

  const overview   = stats?.overview || {};
  const byStatus   = stats?.issuesByStatus || {};
  const byPriority = stats?.issuesByPriority || {};

  const activeProjects = stats?.topProjectsByIssueCount?.length || 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem',
        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Dashboard
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Issue & Bug Tracking Analytics Overview
      </p>

      {state.loading && !stats && (
        <div style={{ color: '#4b5563', textAlign: 'center', padding: '3rem' }}>Loading analytics...</div>
      )}

      <div data-testid="analytics-container">
        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard testid="total-issues-card"    label="Total Issues"    value={overview.totalIssues}   color="#6366f1" icon="🐛" />
          <StatCard testid="active-projects-card" label="Total Projects"  value={overview.totalProjects} color="#8b5cf6" icon="📁" />
          <StatCard testid="open-issues-card"     label="Open Issues"     value={byStatus.open}          color="#f59e0b" icon="⚡" />
          <StatCard testid="closed-issues-card"   label="Closed Issues"   value={byStatus.closed}        color="#22c55e" icon="✅" />
          <StatCard testid="total-users-card"     label="Total Users"     value={overview.totalUsers}    color="#06b6d4" icon="👥" />
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Issues by Status */}
          <div data-testid="issue-chart" style={{
            flex: '1', minWidth: '300px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px', padding: '1.5rem'
          }}>
            <h3 style={{ color: '#111827', margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '700' }}>
              Issues by Status
            </h3>
            <BarChart
              data={byStatus}
              colors={['#f59e0b', '#3b82f6', '#4f46e5', '#22c55e', '#6b7280', '#6366f1']}
            />
          </div>

          {/* Issues by Priority */}
          <div style={{
            flex: '1', minWidth: '300px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px', padding: '1.5rem'
          }}>
            <h3 style={{ color: '#111827', margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: '700' }}>
              Issues by Priority
            </h3>
            <BarChart
              data={byPriority}
              colors={['#22c55e', '#f59e0b', '#ef4444', '#991b1b']}
            />
          </div>
        </div>

        {/* Top Projects Table */}
        {stats?.topProjectsByIssueCount?.length > 0 && (
          <div style={{
            marginTop: '1.5rem',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ color: '#111827', margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                Top Projects by Issue Count
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  {['Project ID', 'Issue Count'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', color: '#4b5563', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.topProjectsByIssueCount.map((p, i) => (
                  <tr key={p.projectId} style={{ borderTop: '1px solid #e5e7eb', background: i % 2 === 0 ? 'transparent' : '#f9fafb' }}>
                    <td style={{ padding: '0.75rem 1.5rem', color: '#4f46e5', fontWeight: '600', fontSize: '0.9rem' }}>{p.projectId}</td>
                    <td style={{ padding: '0.75rem 1.5rem', color: '#111827', fontSize: '0.9rem' }}>{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
