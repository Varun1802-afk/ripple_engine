import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { MOCK_CONVERGENCE_GRAPH } from '../data/mockData.js';
import { Network, ArrowUp, Info, ShieldCheck } from 'lucide-react';

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

export function ConvergenceGraphView() {
  const { convergenceState } = useGraph();
  const [selectedRelation, setSelectedRelation] = useState(null);

  const data = convergenceState.data || MOCK_CONVERGENCE_GRAPH;
  const relationships = Array.isArray(data.relationships) ? data.relationships : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mono-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 700 }}>
            <Network size={15} />
            <span>CONVERGENCE GRAPH ANALYSIS</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Hierarchical Cascade (Level 4 → Level 3 → Level 2 → Level 1)
          </span>
        </div>

        <div className="mono-label" style={{ display: 'flex', gap: '16px' }}>
          <span>CONVERGENCE SCORE: <strong>{safeString(data.convergenceScore, '84')}%</strong></span>
          <span>DIVERGENCE POINTS: <strong>{safeString(data.divergenceCount, '3')}</strong></span>
        </div>
      </div>

      {/* Main Hierarchical Convergence Content */}
      <div className="graph-viewport" style={{ overflow: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="notion-card" style={{ padding: '16px', borderLeft: '4px solid var(--text-primary)' }}>
            <div className="mono-label" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
              CONVERGENCE MATRIX // UPSTREAM CASCADE FLOW
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Click any convergence link to inspect the exact causal relationship mapping terminal outcomes (Level 4) back to initial root triggers (Level 1).
            </p>
          </div>

          {/* Convergence Relationship List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {relationships.map((rel) => {
              const relId = rel.id || `rel-${Math.random()}`;
              const isSelected = selectedRelation?.id === relId;
              return (
                <div
                  key={relId}
                  className={`notion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedRelation(isSelected ? null : { ...rel, id: relId })}
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    borderColor: isSelected ? 'var(--border-strong)' : 'var(--border-medium)',
                    backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono-label level-badge">L{rel.fromLevel || 4}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{safeString(rel.fromTitle, 'Source Node')}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <ArrowUp size={14} />
                      <span className="mono-label" style={{ fontSize: '10px' }}>CASCADE UPWARDS</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono-label level-badge">L{rel.toLevel || 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{safeString(rel.toTitle, 'Target Node')}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono-label" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      RELATIONSHIP: {safeString(rel.relationship, 'Causal Cascade')}
                    </span>
                    <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      [CLICK FOR DETAILS]
                    </span>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>Causal Link Description:</strong> {safeString(rel.description, 'Upstream relationship linking terminal state back to foundational trigger.')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
