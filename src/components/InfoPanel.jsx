import React, { useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { Lock, Info, ShieldAlert, Check, Loader2, Sparkles, Feather, ChevronUp, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';

const safeString = (val, fallback = '') => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      return val.map((v) => safeString(v, fallback)).filter(Boolean).join(', ') || fallback;
    }
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const firstVal = val[keys[0]];
      if (typeof firstVal === 'string' || typeof firstVal === 'number') {
        return `${keys[0]}: ${firstVal}`;
      }
      return keys.join(', ');
    }
  }
  return fallback;
};

export function InfoPanel({ isAlternate = false }) {
  const { selectedNode, handleExpandNode, handleFoldNode, loadingStates, graphLocked, theme } = useGraph();
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
          <p style={{ fontSize: '13px', textAlign: 'center' }}>Select a node in the graph tree to inspect parameters and trigger expansion or folding.</p>
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
        government: 'Neutral',
        economy: 'Severe Risk',
        infrastructure: 'High Criticality'
      };

  return (
    <aside className="info-panel-drawer">
      {/* Drawer Header */}
      <div className="info-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mono-label">INSPECTOR</span>
          <span className="mono-label" style={{ backgroundColor: '#F1F1EF', padding: '2px 6px', borderRadius: '3px', color: '#787774' }}>
            L{levelNumber}
          </span>
        </div>
        {graphLocked && (
          <span className="mono-label" style={{ color: '#C62828', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> LOCKED
          </span>
        )}
      </div>

      {/* Drawer Scroll Body */}
      <div className="info-panel-body" ref={panelBodyRef}>
        {/* Node Label / Title */}
        <div>
          <div className="mono-label" style={{ marginBottom: '4px' }}>NODE TITLE</div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {safeString(selectedNode.label || selectedNode.title, 'Consequence Node')}
          </h2>
        </div>

        {/* Alternate Impact Alert Box (If Viewing Alternate Graph & Affected) */}
        {isAffected && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FFEBEE',
              border: '1px solid #FFCDD2',
              borderRadius: '6px',
              color: '#C62828'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              <ShieldAlert size={14} />
              <span>AFFECTED BY ALTERNATE DECISION</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#B71C1C', lineHeight: 1.4 }}>
              <strong>Effect:</strong> {safeString(selectedNode.alternateImpact?.effectType, 'Modified Domain Risk')}
              <br />
              <strong>Reason:</strong> {safeString(selectedNode.alternateImpact?.reason, 'Cascade effect from alternate policy selection.')}
            </p>
          </div>
        )}

        {/* Node Properties Section */}
        <div>
          <div className="notion-section-title">Parameters</div>
          
          <div className="notion-property-row">
            <span className="notion-property-key">Domain</span>
            <span className="notion-property-value" style={{ fontWeight: 600 }}>{safeString(selectedNode.domain || selectedNode.category, 'General')}</span>
          </div>

          <div className="notion-property-row">
            <span className="notion-property-key">Probability</span>
            <span className="notion-property-value">{selectedNode.probability ? `${Math.round(Number(selectedNode.probability) * 100)}%` : '85%'}</span>
          </div>

          <div className="notion-property-row">
            <span className="notion-property-key">Impact Score</span>
            <span className="notion-property-value">
              <span className="impact-tag negative">{safeString(selectedNode.impactScore || selectedNode.impact, '8.5')} / 10</span>
            </span>
          </div>
        </div>

        {/* Detailed Impact Analysis Description */}
        <div>
          <div className="notion-section-title">Impact Analysis</div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            {safeString(selectedNode.description, 'Systemic consequence evaluating operational resilience, budget allocation, and policy enforcement across regional networks.')}
          </p>
        </div>

        {/* Cross-Domain Impact Tags */}
        <div>
          <div className="notion-section-title">Domain Cascades</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(impactObject).map(([domainKey, statusVal]) => (
              <div key={domainKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{safeString(domainKey, 'Domain')}</span>
                <span className={`impact-tag ${safeString(statusVal).toLowerCase().includes('risk') ? 'negative' : 'neutral'}`}>
                  {safeString(statusVal, 'Active')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Expansion / Folding Action Button */}
        {!isAlternate && (
          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
            {isLevel4 ? (
              <div style={{ padding: '10px', backgroundColor: '#EAE3D2', border: '1px solid var(--border-diorama)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                [Level 4 Terminal Node — No Further Children]
              </div>
            ) : selectedNode.expanded ? (
              <button
                className="btn-notion"
                onClick={() => handleFoldNode(nodeId)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#F7F7F5',
                  border: '1px solid #D3D3D3',
                  color: '#37352F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <ChevronUp size={14} />
                <span>FOLD / COLLAPSE BRANCH</span>
              </button>
            ) : (
              <button
                className="btn-notion btn-notion-primary"
                onClick={() => handleExpandNode(nodeId)}
                disabled={isExpandingThis}
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
                ) : (
                  <>
                    <span>EXPAND NODE &gt;</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
