import React, { createContext, useContext, useState, useEffect } from 'react';
import { setDebugListener } from '../api/apiClient.js';

const DebugContext = createContext(null);

export function DebugProvider({ children }) {
  const [requestLogs, setRequestLogs] = useState([]);
  const [selectedLogIndex, setSelectedLogIndex] = useState(0);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  useEffect(() => {
    // Register listener to intercept and record every outgoing API contract request
    setDebugListener((payload) => {
      setRequestLogs((prev) => [payload, ...prev]);
      setSelectedLogIndex(0); // Automatically highlight newest request
    });
  }, []);

  const clearLogs = () => {
    setRequestLogs([]);
    setSelectedLogIndex(0);
  };

  const toggleDebugPanel = () => {
    setIsDebugPanelOpen((prev) => !prev);
  };

  return (
    <DebugContext.Provider
      value={{
        requestLogs,
        selectedLogIndex,
        setSelectedLogIndex,
        isDebugPanelOpen,
        setIsDebugPanelOpen,
        toggleDebugPanel,
        clearLogs,
        currentLog: requestLogs[selectedLogIndex] || null
      }}
    >
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
