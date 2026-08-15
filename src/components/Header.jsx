import React from 'react';
import { useSession } from '../store/SessionContext.jsx';
import { useGraph } from '../store/GraphContext.jsx';
import { useDebug } from '../store/DebugContext.jsx';
import { 
  Terminal, 
  Lock, 
  Layers, 
  Compass, 
  Network, 
  Palette, 
  Home, 
  PlusCircle, 
  LogOut, 
  User 
} from 'lucide-react';

export function Header() {
  const { isTestMode } = useSession();
  const { 
    activeView, 
    setActiveView, 
    graphLocked, 
    alternateState, 
    loadingStates,
    fetchConvergenceGraph, 
    theme, 
    toggleTheme, 
    user, 
    logoutUser 
  } = useGraph();
  const { requestLogs, toggleDebugPanel, isDebugPanelOpen } = useDebug();

  return (
    <header 
      style={{ 
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px', 
        padding: '0 24px',
        background: 'transparent',
        backgroundColor: 'transparent',
        borderBottom: 'none',
        boxShadow: 'none',
        position: 'relative',
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Group: Brand Title & Primary Nav Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'nowrap' }}>
        {/* Brand Title */}
        <div
          className="brand-title"
          onClick={() => setActiveView('input')}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            flexShrink: 0 
          }}
          title="Click to return to Decision Panel"
        >
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            RIPPLE ENGINE
          </span>
          <span style={{ opacity: 0.4, margin: '0 2px' }}>//</span>
          <span
            style={{
              fontWeight: 500,
              fontSize: '11px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            DECISION ANALYSIS
          </span>
          {isTestMode && (
            <span className="brand-badge" style={{ fontWeight: 600, fontSize: '9px', padding: '1px 5px' }}>
              TEST MODE
            </span>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 4px' }} />

        {/* Primary Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn-notion ${activeView === 'landing' ? 'btn-notion-primary' : ''}`}
            onClick={() => setActiveView('landing')}
            style={{ padding: '5px 10px', fontSize: '11px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            title="Home / Landing Page"
          >
            <Home size={13} />
            <span>Home</span>
          </button>

          <button
            className={`btn-notion ${activeView === 'input' ? 'btn-notion-primary' : ''}`}
            onClick={() => setActiveView('input')}
            style={{ padding: '5px 10px', fontSize: '11px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            title="Analyze New Decision"
          >
            <PlusCircle size={13} />
            <span>Decision Input</span>
          </button>
        </div>
      </div>

      {/* Right Group: Views, Actions & User Account Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
        {/* Navigation Tabs when viewing graph */}
        {activeView !== 'input' && activeView !== 'landing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className={`btn-notion ${activeView === 'original_graph' ? 'btn-notion-primary' : ''}`}
              onClick={() => setActiveView('original_graph')}
              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
            >
              <Layers size={12} />
              <span>Tree</span>
            </button>

            {alternateState.isExploring && (
              <button
                className={`btn-notion ${activeView === 'alternate_graph' ? 'btn-notion-primary' : ''}`}
                onClick={() => setActiveView('alternate_graph')}
                style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
              >
                <Compass size={12} />
                <span>Alternate</span>
              </button>
            )}

            {/* Convergence Graph Navigation Button — Always visible on Graph Views */}
            <button
              className={`btn-notion ${activeView === 'convergence_graph' ? 'btn-notion-primary' : ''}`}
              onClick={fetchConvergenceGraph}
              disabled={loadingStates.isConvergenceLoading}
              style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
              title="Inspect Upstream Causal Convergence Graph"
            >
              <Network size={12} />
              <span>Convergence</span>
            </button>
          </div>
        )}

        {/* Theme Switcher Button - Shown ONLY on Graph Views */}
        {activeView !== 'input' && activeView !== 'landing' && (
          <button
            className="btn-notion"
            onClick={toggleTheme}
            style={{ padding: '4px 10px', fontSize: '11px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            title="Toggle Theme: Eraser.io Technical Diagram <-> 3D Paper Diorama"
          >
            <Palette size={12} />
            <span>{theme === 'diorama' ? 'Theme: Diorama 🎨' : 'Theme: Eraser.io'}</span>
          </button>
        )}

        {/* User Account Profile Pill & Logout Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="mono-label"
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                backgroundColor: 'rgba(0,0,0,0.06)',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <User size={11} />
              <span>{user.email || 'Logged In'}</span>
            </span>

            <button
              className="btn-notion"
              onClick={logoutUser}
              style={{ padding: '4px 8px', fontSize: '10px' }}
              title="Log out of account"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : null}

        {/* Dev Debug Log Trigger Button */}
        <button
          className="btn-notion"
          onClick={toggleDebugPanel}
          style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
          title="Open Developer Request Inspector"
        >
          <Terminal size={12} />
          <span className="mono-label" style={{ fontSize: '10px' }}>LOGS ({requestLogs.length})</span>
        </button>
      </div>
    </header>
  );
}
