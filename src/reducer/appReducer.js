export const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  issues: [],
  projects: [],
  users: [],
  comments: [],
  stats: null,
  filters: { priority: '', status: '', severity: '', search: '' },
  loading: false,
  error: null,
};

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };

    // Auth
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state, loading: false, error: null,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...initialState, token: null, isAuthenticated: false };

    // Data
    case 'SET_ISSUES':   return { ...state, issues: action.payload,   loading: false };
    case 'SET_PROJECTS': return { ...state, projects: action.payload, loading: false };
    case 'SET_USERS':    return { ...state, users: action.payload,    loading: false };
    case 'SET_COMMENTS': return { ...state, comments: action.payload, loading: false };
    case 'SET_STATS':    return { ...state, stats: action.payload,    loading: false };
    case 'SET_FILTERS':  return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
}
