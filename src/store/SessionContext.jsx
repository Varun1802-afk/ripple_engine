import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

const STORAGE_KEY = 'decision_analysis_session_id';

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const updateSessionId = (newId) => {
    if (!newId) return null;
    setSessionId(newId);
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  };

  const createNewSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionId(null);
    return null;
  };

  const resetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionId(null);
    return null;
  };

  return (
    <SessionContext.Provider value={{ sessionId, updateSessionId, createNewSession, resetSession, isTestMode: false }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
