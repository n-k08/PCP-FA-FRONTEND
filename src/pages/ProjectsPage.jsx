import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import API from '../services/api';

const STATUS_COLORS = { active: '#22c55e', inactive: '#6b7280', completed: '#6366f1', 'on-hold': '#f59e0b', archived: '#9ca3af' };

const inputStyle = {
  padding: '0.5rem 0.75rem', background: '#ffffff',
  border: '1px solid #d1d5db', borderRadius: '8px',
  color: '#111827', fontSize: '0.85rem', outline: 'none'
};

export default function ProjectsPage() {
  const { state, dispatch } = useApp();
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newProject, setNewProject] = useState({ projectId: '', title: '', description: '', status: 'active' });
  const [assignData, setAssignData] = useState({ issueId: '', assignedTo: '' });
  const [msg, setMsg] = useState('');
  const limit = 9;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = statusF ? `?status=${statusF}` : '';
      const res = await API.get(`/projects${params}`);
      setProjects(res.data.data);
      setFiltered(res.data.data);
      dispatch({ type: 'SET_PROJECTS', payload: res.data.data });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [statusF]);

  // Client-side search
  useEffect(() => {
    if (!search.trim()) { setFiltered(projects); return; }
    setFiltered(projects.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectId?.toLowerCase().includes(search.toLowerCase())
    ));
    setPage(1);
  }, [search, projects]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated  = filtered.slice((page - 1) * limit, page * limit);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', newProject);
      setMsg('Project created successfully!');
      setShowCreate(false);
      setNewProject({ projectId: '', title: '', description: '', status: 'active' });
      fetchProjects();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to create project'); }
  };

  const handleAssignIssue = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/issues/${assignData.issueId}/assign`, { assignedTo: assignData.assignedTo });
      setMsg('Issue assigned successfully!');
      setShowAssign(false);
      setAssignData({ issueId: '', assignedTo: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to assign issue'); }
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  };
  const modalStyle = {
    background: '#ffffff', border: '1px solid #d1d5db',
    borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px'
  };
  const fieldStyle = { ...inputStyle, width: '100%', marginTop: '0.4rem', boxSizing: 'border-box' };

  return (
    <div data-testid="projects-page" style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Projects</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button data-testid="assign-issue-btn" onClick={() => { setShowAssign(true); setMsg(''); }}
            style={{ padding: '0.5rem 1.1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', color: '#92400e', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
            Assign Issue
          </button>
          <button data-testid="create-project-btn" onClick={() => { setShowCreate(true); setMsg(''); }}
            style={{ padding: '0.5rem 1.1rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
            + New Project
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: msg.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('success') ? '#bbf7d0' : '#fecaca'}`, color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>
          {msg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input data-testid="project-search" style={{ ...inputStyle, minWidth: '220px' }}
          placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        <select data-testid="project-status-filter" style={{ ...inputStyle, cursor: 'pointer' }}
          value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['active', 'inactive', 'completed', 'on-hold', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: 'auto' }}>{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      <div data-testid="project-list"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {loading ? (
          <div style={{ color: '#4b5563', padding: '2rem', gridColumn: '1/-1', textAlign: 'center' }}>Loading...</div>
        ) : paginated.length === 0 ? (
          <div style={{ color: '#6b7280', padding: '2rem', gridColumn: '1/-1', textAlign: 'center' }}>No projects found</div>
        ) : paginated.map(p => (
          <div key={p.projectId}
            data-testid={`project-card-${p.projectId}`}
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', transition: 'all 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: '700' }}>{p.projectId}</span>
              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700', background: `${STATUS_COLORS[p.status] || '#6b7280'}22`, color: STATUS_COLORS[p.status] || '#4b5563', textTransform: 'capitalize' }}>{p.status}</span>
            </div>
            <h3 style={{ color: '#111827', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>{p.title}</h3>
            {p.description && <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: '0 0 0.75rem 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#4b5563' }}>
              {p.members?.length > 0 && <span>👥 {p.members.length} members</span>}
              {p.startDate && <span>📅 {new Date(p.startDate).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
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

      {/* Create Project Modal */}
      {showCreate && (
        <div style={overlayStyle} onClick={() => setShowCreate(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#111827', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              {[['projectId', 'Project ID (e.g. PROJ9999)'], ['title', 'Title'], ['description', 'Description']].map(([key, placeholder]) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#4b5563', fontSize: '0.8rem', marginBottom: '0.4rem', textTransform: 'capitalize' }}>{key}</label>
                  <input required={key !== 'description'} style={fieldStyle} placeholder={placeholder} value={newProject[key]}
                    onChange={e => setNewProject(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{ flex: 1, padding: '0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Issue Modal */}
      {showAssign && (
        <div style={overlayStyle} onClick={() => setShowAssign(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#111827', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Assign Issue</h2>
            <form onSubmit={handleAssignIssue}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#4b5563', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Issue ID</label>
                <input required style={fieldStyle} placeholder="e.g. ISS1001" value={assignData.issueId}
                  onChange={e => setAssignData(p => ({ ...p, issueId: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#4b5563', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Assign To (User MongoDB ID)</label>
                <input required style={fieldStyle} placeholder="MongoDB _id of user" value={assignData.assignedTo}
                  onChange={e => setAssignData(p => ({ ...p, assignedTo: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAssign(false)}
                  style={{ flex: 1, padding: '0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit"
                  style={{ flex: 1, padding: '0.6rem', background: 'rgba(245,158,11,0.8)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
