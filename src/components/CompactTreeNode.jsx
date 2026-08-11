import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { ShieldAlert, ChevronRight, ChevronDown } from 'lucide-react';

export function CompactTreeNode({ node, isAlternate = false }) {
  const { selectedNodeId, selectNode, alternateState, theme } = useGraph();
  const [isHovered, setIsHovered] = useState(false);

  const activeSelectedId = isAlternate ? alternateState.selectedNodeId : selectedNodeId;
  const isSelected = activeSelectedId === (node.id || node._id);

  const alternateImpact = node.alternateImpact;
  const isAffected = isAlternate && alternateImpact && alternateImpact.affected === true;

  const handleNodeClick = (e) => {
    e.stopPropagation();
    selectNode(node.id || node._id, isAlternate);
  };

  const levelNumber = node.graphLevel || node.level || 1;
  const labelText = node.label || node.title || 'Consequence Node';
  const domainText = node.domain || node.category || 'General';

  const getDomainPillClass = (dStr) => {
    const d = (dStr || '').toLowerCase();
    if (d.includes('gov')) return 'domain-pill domain-pill-government';
    if (d.includes('energ')) return 'domain-pill domain-pill-energy';
    if (d.includes('transport')) return 'domain-pill domain-pill-transportation';
    if (d.includes('econ')) return 'domain-pill domain-pill-economy';
    return 'domain-pill domain-pill-default';
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div
        className={`notion-node-card ${isSelected ? 'selected' : ''} ${isAffected ? 'affected-node' : ''}`}
        onClick={handleNodeClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Meta Line: Level & Domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="mono-label" style={{ backgroundColor: '#F1F1EF', padding: '2px 6px', borderRadius: '3px', color: '#787774' }}>
            L{levelNumber}
          </span>
          <span className={`notion-label ${theme === 'diorama' ? getDomainPillClass(domainText) : ''}`} title={domainText} style={{ textTransform: 'capitalize' }}>
            {domainText.toLowerCase()}
          </span>
        </div>

        {/* Node Short Title / Label */}
        <div className="notion-title" title={labelText} style={{ lineHeight: '1.3', marginBottom: '8px' }}>
          {labelText}
        </div>

        {/* Bottom Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
          {levelNumber >= 4 ? (
            <span className="notion-label" style={{ fontSize: '11px' }}>Terminal</span>
          ) : node.expanded ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#37352F' }}>
              <ChevronDown size={14} /> Expanded
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9B9A97' }}>
              <ChevronRight size={14} /> Expandable
            </span>
          )}
        </div>

        {/* Alternate Impact Hover Popover */}
        {isAffected && isHovered && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E2E2',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            padding: '12px',
            width: '240px',
            zIndex: 100,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="notion-label" style={{ fontWeight: 600, color: '#E57373' }}>
                <ShieldAlert size={12} style={{ display: 'inline', marginRight: '4px' }}/>
                IMPACT
              </span>
              <span className={`impact-tag ${alternateImpact.direction?.toLowerCase() || 'neutral'}`}>
                {alternateImpact.direction}
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#37352F', marginBottom: '4px' }}>
              Effect: {alternateImpact.effectType}
            </div>
            <div style={{ fontSize: '12px', color: '#787774', lineHeight: 1.4 }}>
              <strong>Reason:</strong> {alternateImpact.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
