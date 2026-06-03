import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import API from '../services/api';

export default function CommentsPage() {
  const { state, dispatch } = useApp();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ issueId: '', message: '' });
  const [msg, setMsg]           = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/comments');
      setComments(res.data.data);
      dispatch({ type: 'SET_COMMENTS', payload: res.data.data });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, []);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/comments', form);
      setMsg('Comment added successfully!');
      setShowAdd(false);
      setForm({ issueId: '', message: '' });
      fetchComments();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const inputStyle = {
    padding: '0.6rem 0.875rem', background: '#ffffff',
    border: '1px solid #d1d5db', borderRadius: '8px',
    color: '#111827', fontSize: '0.875rem', outline: 'none',
    width: '100%', boxSizing: 'border-box'
  };

  return (
    <div data-testid="comments-page" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Comments</h1>
        <button data-testid="add-comment-btn" onClick={() => { setShowAdd(true); setMsg(''); }}
          style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem' }}>
          + Add Comment
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: msg.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('success') ? '#bbf7d0' : '#fecaca'}`, color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>
          {msg}
        </div>
      )}

      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        {comments.length} comment{comments.length !== 1 ? 's' : ''} total
      </p>

      {/* Comments Table */}
      <div data-testid="comment-table" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Comment ID', 'Issue ID', 'User ID', 'Message', 'Date'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', color: '#4b5563', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading comments...</td></tr>
            ) : comments.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No comments yet</td></tr>
            ) : comments.map((c, i) => (
              <tr key={c.commentId}
                data-testid="comment-row"
                data-comment-id={c.commentId}
                style={{ borderTop: '1px solid #e5e7eb', background: i % 2 ? '#f9fafb' : 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 ? '#f9fafb' : 'transparent'}
              >
                <td style={{ padding: '0.875rem 1rem', color: '#6366f1', fontWeight: '700', fontSize: '0.8rem' }}>{c.commentId}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#4f46e5', fontWeight: '600', fontSize: '0.8rem' }}>{c.issueId}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#4b5563', fontSize: '0.8rem' }}>{c.userId}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#111827', fontSize: '0.875rem', maxWidth: '340px' }}>{c.message}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  {new Date(c.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Comment Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '460px' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#111827', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Add Comment</h2>
            <form onSubmit={handleAddComment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#4b5563', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Issue ID</label>
                <input required style={inputStyle} placeholder="e.g. ISS1001" value={form.issueId}
                  onChange={e => setForm(f => ({ ...f, issueId: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#4b5563', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Message</label>
                <textarea required style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Write your comment..." value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAdd(false)}
                  style={{ flex: 1, padding: '0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit"
                  style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
