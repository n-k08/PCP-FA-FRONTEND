import React, { useEffect, useState } from 'react';
import API from '../services/api';

const ROLE_COLORS = { admin: '#ef4444', manager: '#f59e0b', developer: '#6366f1', tester: '#22c55e' };

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [role, setRole]       = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = role ? `?role=${role}` : '';
        const res = await API.get(`/users${params}`);
        setUsers(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [role]);

  return (
    <div data-testid="users-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem' }}>Users</h1>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <select data-testid="role-filter"
          style={{ padding: '0.5rem 0.75rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#111827', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
          value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          {['admin', 'manager', 'developer', 'tester'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{users.length} user{users.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['User ID', 'Name', 'Email', 'Role', 'Department', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.userId} data-testid={`user-row-${u.userId}`}
                style={{ borderTop: '1px solid #e5e7eb', background: i % 2 ? '#f9fafb' : 'transparent' }}>
                <td style={{ padding: '0.875rem 1rem', color: '#4f46e5', fontWeight: '600', fontSize: '0.85rem' }}>{u.userId}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#111827', fontWeight: '600', fontSize: '0.875rem' }}>{u.name}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.85rem' }}>{u.email}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                    background: `${ROLE_COLORS[u.role] || '#6b7280'}22`,
                    color: ROLE_COLORS[u.role] || '#4b5563',
                    textTransform: 'capitalize'
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.85rem' }}>{u.department}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                    background: u.status === 'active' ? '#22c55e22' : '#6b728022',
                    color: u.status === 'active' ? '#22c55e' : '#6b7280'
                  }}>{u.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
