import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { MOCK_CONVERGENCE_GRAPH } from '../data/mockData.js';
import { Network, ArrowUp, Info, ShieldCheck } from 'lucide-react';

export function ConvergenceGraphView() {
  const { convergenceState } = useGraph();
  const [selectedRelation, setSelectedRelation] = useState(null);

  const data = convergenceState.data || MOCK_CONVERGENCE_GRAPH;
  const relationships = data.relationships || [];

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
          <span>CONVERGENCE SCORE: <strong>{data.convergenceScore}%</strong></span>
          <span>DIVERGENCE POINTS: <strong>{data.divergenceCount}</strong></span>
        </div>
      </div>

      {/* Main Hierarchical Convergence Content */}
      <div className="graph-viewport " style={{ overflow: 'auto', padding: '32px' }}>
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
              const isSelected = selectedRelation?.id === rel.id;
              return (
                <div
                  key={rel.id}
                  className={`notion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedRelation(isSelected ? null : rel)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    borderColor: isSelected ? 'var(--border-strong)' : 'var(--border-medium)',
                    backgroundColor: isSelected ? 'var(--surface-selected)' : 'var(--surface-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono-label level-badge">L{rel.fromLevel}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{rel.fromTitle}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <ArrowUp size={14} />
                      <span className="mono-label" style={{ fontSize: '10px' }}>CASCADE UPWARDS</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono-label level-badge">L{rel.toLevel}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{rel.toTitle}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-medium)', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono-label" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      RELATIONSHIP: {rel.relationship}
                    </span>
                    <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      [CLICK FOR DETAILS]
                    </span>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>Causal Link Description:</strong> {rel.description}
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
