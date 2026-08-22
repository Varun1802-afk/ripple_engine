import React from 'react';
import styled from 'styled-components';
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
  User,
  Sparkles
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
    handleConcludeDecision,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
        {/* Cleaned "Help Me Conclude" Pill Button (Star Logo Removed) */}
        {activeView !== 'landing' && (
          <StyledPillButtonWrapper>
            <button
              className="button"
              onClick={handleConcludeDecision}
              disabled={loadingStates.isConcluding}
              title="Help Me Conclude Decision via Swytchcode Execution Layer"
            >
              <div>
                <div>
                  <div>
                    <Sparkles size={14} style={{ marginRight: '6px' }} />
                    <span>{loadingStates.isConcluding ? 'Concluding...' : 'Help Me Conclude'}</span>
                  </div>
                </div>
              </div>
            </button>
          </StyledPillButtonWrapper>
        )}

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

            {/* Convergence Graph Navigation Button */}
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

        {/* User Auth Profile Pill / Login Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              className="session-pill"
              style={{ padding: '4px 10px', fontSize: '11px', gap: '6px', cursor: 'default' }}
            >
              <User size={12} />
              <span>{user.displayName || user.email}</span>
            </div>
            <button
              className="btn-notion"
              onClick={logoutUser}
              style={{ padding: '4px 8px', fontSize: '11px' }}
              title="Log out of account"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/* Styled Pill Button Wrapper (Star Background Animation Removed) */
const StyledPillButtonWrapper = styled.div`
  display: inline-block;

  .button {
    --stone-50: #fafaf9;
    --stone-800: #292524;
    --yellow-400: #facc15;

    font-family: "Rubik", "Syne", sans-serif;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    line-height: 1;
    font-size: 0.75rem;
    border-radius: 0.75rem;
    border: none;
    background: transparent;
    outline: 2px solid transparent;
    outline-offset: 4px;
    color: var(--stone-50);
    padding: 0;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:active {
      outline-color: var(--yellow-400);
    }

    &:focus-visible {
      outline-color: var(--yellow-400);
      outline-style: dashed;
    }

    & > div {
      padding: 1.5px;
      border-radius: 0.75rem;
      background-color: var(--yellow-400);
      transform: translate(-3px, -3px);
      transition: all 150ms ease;
      box-shadow:
        0.5px 0.5px 0 0 var(--yellow-400),
        1px 1px 0 0 var(--yellow-400),
        1.5px 1.5px 0 0 var(--yellow-400),
        2px 2px 0 0 var(--yellow-400),
        2.5px 2.5px 0 0 var(--yellow-400),
        0 0 0 2px var(--stone-800),
        0.5px 0.5px 0 2px var(--stone-800),
        1px 1px 0 2px var(--stone-800),
        1.5px 1.5px 0 2px var(--stone-800),
        2px 2px 0 2px var(--stone-800),
        0 0 0 3px var(--stone-50),
        0.5px 0.5px 0 3px var(--stone-50),
        1px 1px 0 3px var(--stone-50),
        1.5px 1.5px 0 3px var(--stone-50),
        2px 2px 0 3px var(--stone-50);

      .button:hover & {
        transform: translate(0, 0);
        box-shadow:
          0 0 0 0 var(--yellow-400),
          0 0 0 0 var(--yellow-400),
          0 0 0 2px var(--stone-800),
          0 0 0 2px var(--stone-800),
          0 0 0 3px var(--stone-50),
          0 0 0 3px var(--stone-50);
      }

      & > div {
        position: relative;
        pointer-events: none;
        border-radius: calc(0.75rem - 2px);
        background-color: var(--stone-800);

        &::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          opacity: 0.1;
          background-image: radial-gradient(
              rgb(255 255 255 / 80%) 20%,
              transparent 20%
            ),
            radial-gradient(rgb(255 255 255 / 100%) 20%, transparent 20%);
          background-position:
            0 0,
            4px 4px;
          background-size: 8px 8px;
          mix-blend-mode: hard-light;
          box-shadow: inset 0 0 0 1px var(--stone-800);
          animation: dots 0.4s infinite linear;
          transition: opacity 150ms ease;
        }

        & > div {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0.45rem 0.85rem;
          gap: 0.25rem;
          filter: drop-shadow(0 -1px 0 var(--stone-800));

          &:hover {
            filter: drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.1));
          }

          &:active {
            transform: translateY(2px);
          }
        }
      }
    }
  }

  @keyframes dots {
    0% {
      background-position:
        0 0,
        4px 4px;
    }
    100% {
      background-position:
        8px 0,
        12px 4px;
    }
  }
`;
