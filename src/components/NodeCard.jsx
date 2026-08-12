import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { AlertCircle, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

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

export function NodeCard({ node, isAlternate = false }) {
  const { selectedNodeId, selectNode, alternateState } = useGraph();
  const [isHovered, setIsHovered] = useState(false);

  const activeSelectedId = isAlternate ? alternateState.selectedNodeId : selectedNodeId;
  const isSelected = activeSelectedId === node.id;

  const alternateImpact = node.alternateImpact;
  const isAffected = isAlternate && alternateImpact && alternateImpact.affected === true;

  const handleCardClick = (e) => {
    e.stopPropagation();
    selectNode(node.id, isAlternate);
  };

  return (
    <div
      className={`node-card-paper ${isSelected ? 'selected' : ''} ${isAffected ? 'affected-node' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Restrained Affected Indicator Bar */}
      {isAffected && (
        <div className="affected-indicator-bar">
          <ShieldAlert size={12} />
          <span>AFFECTED // {safeString(alternateImpact.effectType, 'CASCADE EFFECT')}</span>
        </div>
      )}

      {/* Card Header: Level Tag & Category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            className="mono-label"
            style={{
              fontSize: '10px',
              padding: '2px 5px',
              backgroundColor: 'var(--text-primary)',
              color: '#FFFFFF',
              fontWeight: 700
            }}
          >
            L{node.level || 1}
          </span>
          <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {safeString(node.category || node.domain, 'General')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            IMP: {safeString(node.impactScore || node.impact, '8.5')}/10
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.35 }}>
        {safeString(node.title || node.label, 'Consequence Node')}
      </h4>

      {/* Original Description */}
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
        {safeString(node.description, '')}
      </p>

      {/* Card Footer Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
        <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          PROB: {node.probability ? Math.round(Number(node.probability) * 100) : 85}%
        </span>

        <span className="mono-label" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          {node.status === 'expanded' || node.expanded ? (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>[EXPANDED]</span>
          ) : node.level >= 4 ? (
            <span style={{ color: 'var(--text-muted)' }}>[MAX DEPTH L4]</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>UNEXPANDED</span>
          )}
        </span>
      </div>

      {/* Hover Popover Card for Affected Node */}
      {isAffected && isHovered && (
        <div className="impact-popover">
          <div className="impact-popover-row">
            <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 700 }}>
              ALTERNATE IMPACT SUMMARY
            </span>
            <span className={`impact-tag ${safeString(alternateImpact.direction, 'neutral').toLowerCase()}`}>
              {safeString(alternateImpact.direction, 'Neutral')}
            </span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affected-ink)', marginBottom: '4px' }}>
            EFFECT: {safeString(alternateImpact.effectType, 'Modified Risk').toUpperCase()}
          </div>

          <div className="impact-reason-text">
            <strong>Reason:</strong> {safeString(alternateImpact.reason, 'Policy modification cascade')}
          </div>
        </div>
      )}
    </div>
  );
}
