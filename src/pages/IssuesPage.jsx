import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import API from '../services/api';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#991b1b' };
const STATUS_COLORS   = { open: '#f59e0b', 'in-progress': '#3b82f6', testing: '#4f46e5', resolved: '#22c55e', closed: '#6b7280', reopened: '#f97316' };

const Badge = ({ value, colorMap }) => (
  <span style={{
    padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
    background: `${colorMap[value] || '#6b7280'}22`,
    color: colorMap[value] || '#4b5563',
    border: `1px solid ${colorMap[value] || '#6b7280'}44`,
    textTransform: 'capitalize'
  }}>{value}</span>
);

const inputStyle = {
  padding: '0.5rem 0.75rem', background: '#ffffff',
  border: '1px solid #d1d5db', borderRadius: '8px',
  color: '#111827', fontSize: '0.85rem', outline: 'none'
};

export default function IssuesPage() {
  const { state, dispatch } = useApp();
  const [issues, setIssues]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus]     = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading]   = useState(false);
  const limit = 10;

  const fetchIssues = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  overrides.page     ?? page,
        limit,
        ...(overrides.search   ?? search)   && { search:   overrides.search   ?? search },
        ...(overrides.priority ?? priority) && { priority: overrides.priority ?? priority },
        ...(overrides.status   ?? status)   && { status:   overrides.status   ?? status },
        ...(overrides.severity ?? severity) && { severity: overrides.severity ?? severity },
      });
      const res = await API.get(`/issues?${params}`);
      const fetched = res.data.data.issues;
      const tot     = res.data.data.total;
      setIssues(fetched);
      setTotal(tot);
      dispatch({ type: 'SET_ISSUES', payload: fetched });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIssues(); }, [page, priority, status, severity]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchIssues({ page: 1 }); };
  const totalPages = Math.ceil(total / limit);

  return (
    <div data-testid="issues-page" style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Issues</h1>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{total} issue{total !== 1 ? 's' : ''} found</span>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            data-testid="issue-search"
            style={{ ...inputStyle, minWidth: '220px' }}
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" style={{
            padding: '0.5rem 1rem', background: '#6366f1', border: 'none',
            borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
          }}>Search</button>
        </form>

        <select data-testid="issue-filter" style={{ ...inputStyle, cursor: 'pointer' }}
          value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select data-testid="issue-status-filter" style={{ ...inputStyle, cursor: 'pointer' }}
          value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['open', 'in-progress', 'testing', 'resolved', 'closed', 'reopened'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select data-testid="issue-severity-filter" style={{ ...inputStyle, cursor: 'pointer' }}
          value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }}>
          <option value="">All Severities</option>
          {['minor', 'major', 'critical', 'blocker'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div data-testid="issue-table" style={{
        background: '#ffffff', border: '1px solid #e5e7eb',
        borderRadius: '16px', overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Issue ID', 'Title', 'Project', 'Priority', 'Severity', 'Status', 'Assigned To'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading issues...</td></tr>
            ) : issues.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No issues found</td></tr>
            ) : issues.map((issue, i) => (
              <tr key={issue.issueId}
                data-testid="issue-row"
                data-issue-id={issue.issueId}
                style={{ borderTop: '1px solid #e5e7eb', background: i % 2 ? '#f9fafb' : 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? '#f9fafb' : 'transparent'}
              >
                <td style={{ padding: '0.875rem 1rem', color: '#4f46e5', fontWeight: '700', fontSize: '0.85rem' }}>{issue.issueId}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#111827', fontSize: '0.875rem', maxWidth: '240px' }}>{issue.title}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.8rem' }}>{issue.projectId}</td>
                <td style={{ padding: '0.875rem 1rem' }}><Badge value={issue.priority} colorMap={PRIORITY_COLORS} /></td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.8rem', textTransform: 'capitalize' }}>{issue.severity || '—'}</td>
                <td style={{ padding: '0.875rem 1rem' }}><Badge value={issue.status} colorMap={STATUS_COLORS} /></td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.8rem' }}>{issue.assignedTo || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button data-testid="pagination-prev"
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '0.4rem 1rem', background: page === 1 ? '#e5e7eb' : '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            ← Prev
          </button>
          <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button data-testid="pagination-next"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '0.4rem 1rem', background: page === totalPages ? '#e5e7eb' : '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
