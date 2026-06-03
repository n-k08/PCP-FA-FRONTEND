import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer, initialState } from '../reducer/appReducer';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync window.appState on every state change
  useEffect(() => {
    window.appState = {
      authUser:  state.user,
      token:     state.token,
      users:     state.users,
      projects:  state.projects,
      issues:    state.issues,
      comments:  state.comments,
      filters:   state.filters || {},
      analytics: state.stats || {}
    };
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
