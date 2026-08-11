import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext';
import { Search, Lock, ExternalLink, Trash2, Calendar, FileText, X, Maximize2, Minimize2, PlusCircle, Check } from 'lucide-react';

export function MacNotesModal({ isOpen, onClose, onOpenLoginModal }) {
  const { user, savedSessions, loadExistingSession, setActiveView } = useGraph();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filteredSessions = (savedSessions || []).filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.sessionId?.toLowerCase().includes(q) ||
      item.decision?.toLowerCase().includes(q)
    );
  });

  const handleOpenSession = async (sessionId) => {
    onClose();
    await loadExistingSession(sessionId);
    setActiveView('original_graph');
  };

  const handleCopyId = (sessionId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sessionId);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        padding: '24px'
      }}
      onClick={onClose}
    >
      {/* macOS Native App Window Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMaximized ? '95vw' : '760px',
          height: isMaximized ? '90vh' : '520px',
          maxHeight: '90vh',
          maxWidth: '98vw',
          backgroundColor: '#1E1E1E',
          borderRadius: '12px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#E5E5E5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
        }}
      >
        {/* macOS Native App Titlebar with Red, Yellow, Green Traffic Light Controls */}
        <div
          style={{
            height: '38px',
            backgroundColor: '#2D2D2D',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            userSelect: 'none'
          }}
        >
          {/* macOS Red, Yellow, Green Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FF5F56',
                border: '1px solid #E0443E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="Close Notes (Red)"
            >
              <X size={8} color="#4C0000" style={{ opacity: 0 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)} onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FFBD2E',
                border: '1px solid #DEA123',
                cursor: 'pointer',
                padding: 0
              }}
              title="Minimize (Yellow)"
            />
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#27C93F',
                border: '1px solid #1AAB29',
                cursor: 'pointer',
                padding: 0
              }}
              title="Toggle Fullscreen (Green)"
            />
          </div>

          {/* Window Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#A3A3A3' }}>
            <span>📝</span>
            <span>Notes.app — Saved Decision Sessions</span>
          </div>

          <div style={{ width: '40px' }} />
        </div>

        {/* Notes Window Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* CASE A: User is NOT Logged In */}
          {!user ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#181818'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Lock size={28} color="#FACC15" />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                Account Authentication Required
              </h3>

              <p style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '380px', lineHeight: 1.5, marginBottom: '24px' }}>
                You must log in to your account to view and access your saved decision session IDs in Notes.app.
              </p>

              <button
                className="btn-notion btn-notion-primary"
                onClick={() => {
                  onClose();
                  if (onOpenLoginModal) onOpenLoginModal();
                }}
                style={{
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#FACC15',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Sign In / Sign Up First
              </button>
            </div>
          ) : (
            /* CASE B: User IS Logged In */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#181818' }}>
              {/* Search Header Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#262626',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Search size={14} color="#9CA3AF" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved session IDs or prompt keywords..."
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      width: '100%'
                    }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>
                  {filteredSessions.length} {filteredSessions.length === 1 ? 'Session' : 'Sessions'} Saved
                </div>
              </div>

              {/* Sessions List */}
              <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredSessions.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#737373', gap: '10px', paddingTop: '40px' }}>
                    <FileText size={36} strokeWidth={1.5} />
                    <p style={{ fontSize: '13px', margin: 0, textAlign: 'center', maxWidth: '320px' }}>
                      {searchQuery ? 'No matching saved sessions found.' : 'No saved decision sessions yet. Generate a decision analysis and click "Save Session to Account".'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((item, idx) => (
                    <div
                      key={item.sessionId || idx}
                      onClick={() => handleOpenSession(item.sessionId)}
                      style={{
                        backgroundColor: '#262626',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#323232';
                        e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#262626';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#FACC15',
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>Session ID: {item.sessionId}</span>
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={(e) => handleCopyId(item.sessionId, e)}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '3px 8px',
                              color: '#A3A3A3',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Copy Session ID"
                          >
                            {copiedId === item.sessionId ? <Check size={10} color="#34D399" /> : null}
                            <span>{copiedId === item.sessionId ? 'Copied!' : 'Copy ID'}</span>
                          </button>

                          <span style={{ fontSize: '10px', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={10} />
                            <span>{item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'Recent'}</span>
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '12px', color: '#D4D4D4', lineHeight: 1.4, margin: 0 }}>
                        {item.decision}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#60A5FA',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Consequence Graph</span>
                          <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
