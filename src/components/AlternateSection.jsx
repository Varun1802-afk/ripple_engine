import React, { useState, useEffect } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { Compass, ArrowRight, GitFork, ChevronLeft, ChevronRight, Layers, Network, X, ChevronUp, ChevronDown, Bookmark, BookmarkCheck, Loader2, AlertCircle } from 'lucide-react';

export function AlternateSection() {
  const {
    graphLocked,
    handleExploreAlternate,
    loadingStates,
    activeView,
    setActiveView,
    alternateState,
    fetchConvergenceGraph,
    sessionId,
    decision,
    saveSessionToAccount,
    savedSessions
  } = useGraph();

  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (sessionId && savedSessions.some((s) => s.sessionId === sessionId)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [sessionId, savedSessions]);

  const handleSaveSession = () => {
    const res = saveSessionToAccount({ sessionId, decision });
    if (res.success) {
      setIsSaved(true);
    }
  };

  // Automatically open drawer when graph is locked
  useEffect(() => {
    if (graphLocked) {
      setIsOpen(true);
    }
  }, [graphLocked]);

  if (!graphLocked) return null;

  const cardsList = alternateState.alternateCards && Array.isArray(alternateState.alternateCards)
    ? alternateState.alternateCards
    : [];

  const isCardLoading = loadingStates.isLocking || (cardsList.length === 0 && !alternateState.isTimeout);
  const isTimeoutState = cardsList.length === 0 && alternateState.isTimeout;

  const currentOption = cardsList.length > 0 ? (cardsList[currentIndex] || cardsList[0]) : null;

  const handlePrev = () => {
    if (cardsList.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? cardsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (cardsList.length === 0) return;
    setCurrentIndex((prev) => (prev === cardsList.length - 1 ? 0 : prev + 1));
  };

  const handleExploreCurrent = () => {
    if (currentOption) {
      handleExploreAlternate(currentOption);
    }
  };

  return (
    <>
      {/* Floating Re-open Button when Collapsed */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
          <button
            className="btn-notion btn-notion-primary"
            onClick={() => setIsOpen(true)}
            style={{
              padding: '10px 18px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Open Alternate Scenario Panel"
          >
            <Compass size={14} />
            <span>Alternate Scenarios ({cardsList.length})</span>
            <ChevronUp size={14} />
          </button>
        </div>
      )}

      {/* Main Animated Carousel Drawer */}
      <div
        style={{
          backgroundColor: 'var(--bg-main)',
          borderTop: isOpen ? '1px solid var(--border-light)' : 'none',
          padding: isOpen ? '20px 32px' : '0 32px',
          maxHeight: isOpen ? '420px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen ? '0 -4px 20px rgba(0,0,0,0.06)' : 'none',
          position: 'relative',
          zIndex: 45
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header Toolbar & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="mono-label" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitFork size={14} />
                <span>STAGE 2: ALTERNATE COUNTER-DECISION & CONVERGENCE</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0' }}>
                {isCardLoading ? 'Generating Alternate Scenarios...' : isTimeoutState ? 'Alternate Scenario Analysis' : `Alternate Scenario Analysis (${cardsList.length} Options)`}
              </h2>
            </div>

            {/* View Switcher Tabs & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className={`btn-notion ${activeView === 'original_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                  onClick={() => setActiveView('original_graph')}
                  style={{ padding: '5px 12px', fontSize: '12px' }}
                >
                  <Layers size={13} />
                  <span>Original Graph</span>
                </button>

                {alternateState.isExploring && (
                  <button
                    className={`btn-notion ${activeView === 'alternate_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                    onClick={() => setActiveView('alternate_graph')}
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                  >
                    <Compass size={13} />
                    <span>Alternate Graph View</span>
                  </button>
                )}

                {alternateState.isExploring && (
                  <button
                    className={`btn-notion ${activeView === 'convergence_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                    onClick={fetchConvergenceGraph}
                    disabled={loadingStates.isConvergenceLoading}
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                  >
                    <Network size={13} />
                    <span>Convergence Graph</span>
                  </button>
                )}
              </div>

              {/* Close Drawer Button */}
              <button
                className="btn-notion"
                onClick={() => setIsOpen(false)}
                style={{ padding: '6px', borderRadius: '4px' }}
                title="Collapse Alternate Scenario Panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Conditional Content Area: Loading Spinner VS Timeout Warning VS Real Cards */}
          {isCardLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', gap: '12px', minHeight: '120px' }}>
              <Loader2 size={24} className="spin" color="#2EAADC" />
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                Generating alternate decision cards from World-State workflow...
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Polling database every 3 seconds (Up to 5 minutes max)...
              </span>
            </div>
          ) : isTimeoutState ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', gap: '8px', minHeight: '120px', backgroundColor: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: '8px' }}>
              <AlertCircle size={22} color="#DC2626" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                No alternate decision available
              </span>
              <span style={{ fontSize: '12px', color: '#B91C1C' }}>
                World-State workflow did not return alternate cards within 5 minutes for session: <code style={{ fontWeight: 700 }}>{sessionId}</code>
              </span>
            </div>
          ) : (
            /* Carousel Experience for Real Cards */
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                className="btn-notion"
                onClick={handlePrev}
                disabled={cardsList.length <= 1}
                style={{ padding: '12px 14px' }}
                title="Previous alternate decision card"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Active Carousel Card */}
              <div
                className="notion-card selected"
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderWidth: '1px',
                  borderColor: '#2EAADC',
                  minHeight: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {currentOption && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        OPTION {currentIndex + 1} OF {cardsList.length} // {currentOption.category || currentOption.strategyType || 'Policy'}
                      </span>
                      <span className="mono-label" style={{ fontSize: '10px', fontWeight: 700, color: '#2EAADC' }}>
                        [ACTIVE SELECTION]
                      </span>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {currentOption.tagline || currentOption.title || currentOption.decision?.slice(0, 90)}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {currentOption.decision || currentOption.description}
                    </p>
                  </div>
                )}
              </div>

              <button
                className="btn-notion"
                onClick={handleNext}
                disabled={cardsList.length <= 1}
                style={{ padding: '12px 14px' }}
                title="Next alternate decision card"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                className={`btn-notion ${isSaved ? 'btn-notion-primary' : ''}`}
                onClick={handleSaveSession}
                style={{
                  padding: '7px 16px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSaved ? '#ECFDF5' : 'transparent',
                  borderColor: isSaved ? '#10B981' : 'var(--border-color)',
                  color: isSaved ? '#047857' : 'var(--text-primary)'
                }}
                title="Save this decision analysis session ID to your account"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={14} className="text-emerald-600" />
                    <span>SESSION SAVED TO ACCOUNT</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    <span>SAVE SESSION TO ACCOUNT</span>
                  </>
                )}
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Session ID: <code style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sessionId}</code>
              </span>
            </div>

            <button
              className="btn-notion btn-notion-primary"
              onClick={handleExploreCurrent}
              disabled={loadingStates.isAlternateLoading || isCardLoading || isTimeoutState || !currentOption}
              style={{ padding: '8px 20px', fontSize: '12px' }}
            >
              {loadingStates.isAlternateLoading ? (
                <span>Loading Alternate Graph...</span>
              ) : (
                <>
                  <span>EXPLORE ALTERNATE PATH</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
