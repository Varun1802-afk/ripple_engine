import React, { useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { Lock, Info, ShieldAlert, Check, Loader2, Sparkles, Feather } from 'lucide-react';
import { gsap } from 'gsap';

export function InfoPanel({ isAlternate = false }) {
  const { selectedNode, handleExpandNode, loadingStates, graphLocked, theme } = useGraph();
  const panelBodyRef = useRef(null);

  // GSAP y:10 slide-up animation for each panel section on node selection change
  useEffect(() => {
    if (panelBodyRef.current && panelBodyRef.current.children && panelBodyRef.current.children.length > 0) {
      gsap.fromTo(
        panelBodyRef.current.children,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.06,
          ease: 'power2.out'
        }
      );
    }
  }, [selectedNode?.id, selectedNode?._id]);

  if (!selectedNode) {
    return (
      <aside className="info-panel-drawer">
        <div className="info-panel-header">
          <span className="mono-label">Node Inspector</span>
        </div>
        <div className="info-panel-body" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <Info size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '13px', textAlign: 'center' }}>Select a node in the graph tree to inspect parameters and trigger expansion.</p>
        </div>
      </aside>
    );
  }

  const nodeId = selectedNode.id || selectedNode._id || '17862A3772176-QZIBFUAJ_N00E3';
  const levelNumber = selectedNode.graphLevel || selectedNode.level || 1;
  const isLevel4 = levelNumber >= 4;
  const isExpandingThis = loadingStates.expandingNodeId === nodeId;
  const isAffected = isAlternate && selectedNode.alternateImpact?.affected === true;

  // Format domain impact object matching reference image values
  const impactObject = typeof selectedNode.impact === 'object' && selectedNode.impact !== null 
    ? selectedNode.impact 
    : {
        [selectedNode.domain || 'Transportation']: 49,
        Energy: 38,
        Government: 85,
        Employment: 25
      };

  const getDomainClass = (key) => {
    const k = key.toLowerCase();
    if (k.includes('transport')) return 'domain-fill-transportation';
    if (k.includes('energ')) return 'domain-fill-energy';
    if (k.includes('govern')) return 'domain-fill-government';
    if (k.includes('employ')) return 'domain-fill-employment';
    if (k.includes('econom')) return 'domain-fill-economy';
    if (k.includes('manufactur')) return 'domain-fill-manufacturing';
    return 'domain-fill-default';
  };

  return (
    <aside className="info-panel-drawer">
      {/* 1. STRICT COMPONENT 1: HEADER SECTION MATCHING SCREENSHOT */}
      <div className="info-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Square Dark Paper Badge with Vertical Stacked LEVEL / 1 */}
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: theme === 'marauder' ? '#3B2412' : '#4A3B32',
              color: '#FFFDF8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 800,
              lineHeight: 1.1,
              borderRadius: '0px',
              boxShadow: '1px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <span>LEVEL</span>
            <span style={{ fontSize: '14px' }}>{levelNumber}</span>
          </div>

          {/* Category & ID String */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="mono-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              {(selectedNode.domain || selectedNode.category || 'GOVERNMENT').toUpperCase()}
            </span>
            <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              ID: {nodeId}
            </span>
          </div>
        </div>
      </div>

      <div className="info-panel-body" ref={panelBodyRef}>
        {/* 2. STRICT COMPONENT 2: NODE TITLE & DOMAIN SUBTITLE */}
        <div style={{ padding: '0 4px' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {selectedNode.label || selectedNode.title || 'Higher upfront capital expenditure for public vehicle procurement'}
          </h2>
          <div className="mono-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            DOMAIN: {(selectedNode.domain || selectedNode.category || 'GOVERNMENT').toUpperCase()}
          </div>
        </div>

        {/* 3. STRICT COMPONENT 3: DOMAIN IMPACT ANALYSIS CARD */}
        <div className="notion-info-card">
          <div className="mono-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '0.04em' }}>
            DOMAIN IMPACT ANALYSIS (0-100)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(impactObject).map(([domainKey, rawScoreVal]) => {
              const numVal = typeof rawScoreVal === 'number' ? rawScoreVal : parseFloat(rawScoreVal) || 0;
              const percentVal = Math.min(100, Math.max(0, numVal));

              return (
                <div key={domainKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <span>{domainKey}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {Math.round(percentVal)} / 100
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#EFEFEF', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentVal}%`,
                        height: '100%',
                        backgroundColor: percentVal >= 50 ? '#37352F' : percentVal > 0 ? '#787774' : 'transparent',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. STRICT COMPONENT 4: NODE SPECIFICATION DESCRIPTION CARD */}
        <div className="notion-info-card">
          <div className="mono-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            NODE SPECIFICATION DESCRIPTION
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
            {selectedNode.description || 'Purchasing electric or alternative fuel vehicles involves higher initial costs compared to conventional models. This impacts government budgets and may require reallocation of funds or additional financing.'}
          </p>
        </div>

        {/* Component 5: Alternate Impact Details (If inspecting in Alternate View) */}
        {isAffected && selectedNode.alternateImpact && (
          <div className="notion-info-card" style={{ borderColor: '#E57373', backgroundColor: '#FDF5F5' }}>
            <div className="mono-label" style={{ fontSize: '10px', color: '#E57373', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldAlert size={13} />
              <span>ALTERNATE IMPACT ASSESSMENT</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="mono-label" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#F9EBEB', color: '#E57373', fontWeight: 600 }}>
                EFFECT: {selectedNode.alternateImpact.effectType}
              </span>
              <span className={`impact-tag ${selectedNode.alternateImpact.direction?.toLowerCase() || 'neutral'}`}>
                {selectedNode.alternateImpact.direction}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              <strong>Reason:</strong> {selectedNode.alternateImpact.reason}
            </p>
          </div>
        )}


        {/* 6. STRICT COMPONENT 6: PRIMARY ACTION BUTTON */}
        {!isAlternate && (
          <div style={{ marginTop: 'auto', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {graphLocked ? (
              <div style={{ padding: '12px', backgroundColor: theme === 'marauder' ? '#FAF0D9' : '#EAE3D2', border: '1px solid var(--border-diorama)', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Lock size={14} color="var(--theater-crimson)" />
                <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>
                  {theme === 'marauder' ? '✨ MISCHIEF MANAGED (GRAPH LOCKED)' : 'Graph is locked. Expansion disabled.'}
                </span>
              </div>
            ) : isLevel4 ? (
              <div style={{ padding: '10px', backgroundColor: '#EAE3D2', border: '1px solid var(--border-diorama)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                [Level 4 Terminal Node — No Further Children]
              </div>
            ) : (
              <>
                <button
                  className="btn-notion btn-notion-primary"
                  onClick={() => handleExpandNode(nodeId)}
                  disabled={isExpandingThis || selectedNode.expanded}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isExpandingThis ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={14} className="spin" />
                      <span>Extending Branch (Level {levelNumber + 1})...</span>
                    </span>
                  ) : selectedNode.expanded ? (
                    <>
                      <Check size={14} />
                      <span>NODE EXPANDED</span>
                    </>
                  ) : (
                    <>
                      <span>EXPAND NODE &gt;</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
