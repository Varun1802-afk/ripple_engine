import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGraph } from '../store/GraphContext.jsx';
import { Compass, ArrowRight, GitFork, ChevronLeft, ChevronRight, Layers, Network, X, ChevronUp, Bookmark, BookmarkCheck, Loader2, AlertCircle, RefreshCw, CheckCircle2, AlertTriangle, Shield, Clock, Zap } from 'lucide-react';

const StyledCardWrapper = styled.div`
  flex: 1;
  border-radius: 30px;
  background: #e0e0e0;
  box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.3s ease-in-out;
  color: #1F2937;

  &:hover {
    box-shadow: 18px 18px 36px #b8b8b8, -18px -18px 36px #ffffff;
  }

  .card-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 12px;
  }

  .card-metrics-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    background: #e0e0e0;
    box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
    padding: 12px 18px;
    border-radius: 20px;
  }

  .card-callout-box {
    flex: 1;
    min-width: 240px;
    background: #e0e0e0;
    box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
    padding: 12px 16px;
    border-radius: 18px;
  }
`;

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
    savedSessions,
    lockGraph
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

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

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
          backgroundColor: '#E6E8EC',
          borderTop: isOpen ? '1px solid var(--border-light)' : 'none',
          padding: isOpen ? '24px 32px' : '0 32px',
          maxHeight: isOpen ? '580px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflowY: 'auto',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen ? '0 -4px 20px rgba(0,0,0,0.06)' : 'none',
          position: 'relative',
          zIndex: 45
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Header Toolbar & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="mono-label" style={{ color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitFork size={14} color="#2563EB" />
                <span>STAGE 2: ALTERNATE COUNTER-DECISION & CONVERGENCE</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                {isCardLoading ? 'Retrieving Alternate Scenarios...' : isTimeoutState ? 'Alternate Scenario Analysis' : `Alternate Scenario Analysis (${cardsList.length} Options)`}
              </h2>
            </div>

            {/* View Switcher Tabs & Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className={`btn-notion ${activeView === 'original_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                  onClick={() => setActiveView('original_graph')}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  <Layers size={13} />
                  <span>Original Graph</span>
                </button>

                {alternateState.isExploring && (
                  <button
                    className={`btn-notion ${activeView === 'alternate_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                    onClick={() => setActiveView('alternate_graph')}
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    <Compass size={13} />
                    <span>Alternate Graph View</span>
                  </button>
                )}

                {/* Convergence Graph Navigation Button */}
                <button
                  className={`btn-notion ${activeView === 'convergence_graph' ? 'btn-notion-primary' : 'btn-notion'}`}
                  onClick={fetchConvergenceGraph}
                  disabled={loadingStates.isConvergenceLoading}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                  title="Inspect Upstream Causal Convergence Graph"
                >
                  <Network size={13} />
                  <span>Convergence Graph</span>
                </button>
              </div>

              {/* Close Drawer Button */}
              <button
                className="btn-notion"
                onClick={() => setIsOpen(false)}
                style={{ padding: '6px', borderRadius: '6px' }}
                title="Collapse Alternate Scenario Panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Conditional Content Area: Loading Spinner VS Error Notice VS Neumorphic Card */}
          {isCardLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', gap: '12px', minHeight: '160px' }}>
              <Loader2 size={26} className="spin" color="#2563EB" />
              <span style={{ fontSize: '13px', color: '#1F2937', fontWeight: 700 }}>
                Retrieving alternate decision cards from database...
              </span>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                Session ID: <code style={{ fontWeight: 700 }}>{sessionId}</code>
              </span>
            </div>
          ) : isTimeoutState ? (
            /* Error & RETRY Option */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '12px', backgroundColor: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: '20px' }}>
              <AlertCircle size={24} color="#DC2626" />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B', display: 'block' }}>
                  {alternateState.errorMessage || "Unable to retrieve alternate decision cards"}
                </span>
                <span style={{ fontSize: '12px', color: '#B91C1C' }}>
                  Database query for session <code style={{ fontWeight: 700 }}>{sessionId}</code> returned no alternate cards.
                </span>
              </div>
              <button
                className="btn-notion btn-notion-primary"
                onClick={lockGraph}
                style={{ padding: '6px 16px', fontSize: '12px', gap: '6px', backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
              >
                <RefreshCw size={13} />
                <span>Retry Fetching Alternate Cards</span>
              </button>
            </div>
          ) : (
            /* Carousel Experience with Neumorphic Styled Card */
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '20px' }}>
              <button
                className="btn-notion"
                onClick={handlePrev}
                disabled={cardsList.length <= 1}
                style={{ padding: '14px 16px', borderRadius: '16px', alignSelf: 'center' }}
                title="Previous alternate decision card"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Styled Neumorphic Card Container */}
              {currentOption && (
                <StyledCardWrapper>
                  {/* Top Bar: Alternate ID + Category + Strategy + Time Horizon */}
                  <div className="card-top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono-label" style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', backgroundColor: '#DBEAFE', padding: '3px 10px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                        ID: {currentOption.alternateId || currentOption.id || `alt_00${currentIndex + 1}`}
                      </span>

                      <span className="domain-pill domain-pill-technology">
                        {currentOption.category || 'Technology'}
                      </span>

                      {currentOption.strategyType && (
                        <span className="mono-label" style={{ fontSize: '10px', backgroundColor: '#D1D5DB', color: '#374151', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          Strategy: {currentOption.strategyType}
                        </span>
                      )}

                      {currentOption.timeHorizon && (
                        <span className="mono-label" style={{ fontSize: '10px', backgroundColor: '#D1D5DB', color: '#374151', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} />
                          {currentOption.timeHorizon}
                        </span>
                      )}
                    </div>

                    <div className="mono-label" style={{ fontSize: '11px', fontWeight: 800, color: '#4B5563' }}>
                      OPTION {currentIndex + 1} OF {cardsList.length}
                    </div>
                  </div>

                  {/* Main Title Tagline & Decision Statement */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                      {currentOption.tagline || currentOption.title || currentOption.decision}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                      {currentOption.decision || currentOption.description}
                    </p>
                  </div>

                  {/* Neumorphic Inset Metric Badges */}
                  <div className="card-metrics-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Zap size={14} color="#2563EB" />
                      <span style={{ color: '#4B5563', fontWeight: 600 }}>Feasibility:</span>
                      <strong style={{ color: '#2563EB' }}>{currentOption.feasibilityScore ?? currentOption.previewMetrics?.feasibility ?? 80}%</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Shield size={14} color="#059669" />
                      <span style={{ color: '#4B5563', fontWeight: 600 }}>Impact Score:</span>
                      <strong style={{ color: '#059669' }}>{currentOption.impactScore ?? currentOption.previewMetrics?.impact ?? 65}%</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <AlertTriangle size={14} color="#DC2626" />
                      <span style={{ color: '#4B5563', fontWeight: 600 }}>Risk Score:</span>
                      <strong style={{ color: '#DC2626' }}>{currentOption.riskScore ?? currentOption.previewMetrics?.risk ?? 35}%</strong>
                    </div>

                    {currentOption.opportunityScore && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                        <CheckCircle2 size={14} color="#7C3AED" />
                        <span style={{ color: '#4B5563', fontWeight: 600 }}>Opportunity:</span>
                        <strong style={{ color: '#7C3AED' }}>{currentOption.opportunityScore}%</strong>
                      </div>
                    )}
                  </div>

                  {/* Why Different & Expected Outcome */}
                  {(currentOption.whyDifferent || currentOption.expectedOutcome) && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {currentOption.whyDifferent && (
                        <div className="card-callout-box" style={{ borderLeft: '4px solid #2563EB' }}>
                          <span className="mono-label" style={{ fontSize: '10px', color: '#2563EB', fontWeight: 800, display: 'block', marginBottom: '3px' }}>
                            WHY THIS IS DIFFERENT
                          </span>
                          <p style={{ fontSize: '11px', color: '#374151', lineHeight: 1.4, margin: 0 }}>
                            {currentOption.whyDifferent}
                          </p>
                        </div>
                      )}

                      {currentOption.expectedOutcome && (
                        <div className="card-callout-box" style={{ borderLeft: '4px solid #10B981' }}>
                          <span className="mono-label" style={{ fontSize: '10px', color: '#047857', fontWeight: 800, display: 'block', marginBottom: '3px' }}>
                            EXPECTED OUTCOME
                          </span>
                          <p style={{ fontSize: '11px', color: '#064E3B', lineHeight: 1.4, margin: 0 }}>
                            {currentOption.expectedOutcome}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bullet Highlights: Advantages vs Tradeoffs */}
                  {(safeArray(currentOption.advantages).length > 0 || safeArray(currentOption.tradeoffs).length > 0) && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {safeArray(currentOption.advantages).length > 0 && (
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <span className="mono-label" style={{ fontSize: '10px', color: '#059669', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                            ADVANTAGES
                          </span>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#374151', lineHeight: 1.4 }}>
                            {safeArray(currentOption.advantages).map((adv, i) => (
                              <li key={i}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {safeArray(currentOption.tradeoffs).length > 0 && (
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <span className="mono-label" style={{ fontSize: '10px', color: '#DC2626', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                            TRADEOFFS
                          </span>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#374151', lineHeight: 1.4 }}>
                            {safeArray(currentOption.tradeoffs).map((tr, i) => (
                              <li key={i}>{tr}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Affected Domains Badges */}
                  {safeArray(currentOption.affectedDomains).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                      <span className="mono-label" style={{ fontSize: '10px', color: '#6B7280', fontWeight: 700 }}>AFFECTED DOMAINS:</span>
                      {safeArray(currentOption.affectedDomains).map((dom, i) => (
                        <span key={i} className="mono-label" style={{ fontSize: '10px', backgroundColor: '#D1D5DB', color: '#1F2937', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {dom}
                        </span>
                      ))}
                    </div>
                  )}

                </StyledCardWrapper>
              )}

              <button
                className="btn-notion"
                onClick={handleNext}
                disabled={cardsList.length <= 1}
                style={{ padding: '14px 16px', borderRadius: '16px', alignSelf: 'center' }}
                title="Next alternate decision card"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
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
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                Session ID: <code style={{ fontWeight: 700, color: '#111827' }}>{sessionId}</code>
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
                  <span>EXPLORE ALTERNATE PATH ({currentOption?.alternateId || currentOption?.id || 'ALT_001'})</span>
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
