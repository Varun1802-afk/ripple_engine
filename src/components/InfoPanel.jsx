import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGraph } from '../store/GraphContext.jsx';
import { 
  Lock, 
  Info, 
  ShieldAlert, 
  ChevronUp, 
  Loader2, 
  Zap, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  GitCommit, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';
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
  const { selectedNode, handleExpandNode, handleFoldNode, loadingStates, graphLocked } = useGraph();
  const panelBodyRef = useRef(null);

  // GSAP y:10 slide-up animation for each panel section on node selection change
  useEffect(() => {
    if (panelBodyRef.current && panelBodyRef.current.children && panelBodyRef.current.children.length > 0) {
      gsap.fromTo(
        panelBodyRef.current.children,
        { y: 12, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.05,
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
          <p style={{ fontSize: '13px', textAlign: 'center' }}>Select a node in the graph tree to inspect graphical parameters and metrics.</p>
        </div>
      </aside>
    );
  }

  const nodeId = selectedNode.id || selectedNode._id || '17862A3772176-QZIBFUAJ_N00E3';
  const levelNumber = Number(selectedNode.graphLevel || selectedNode.level || 1);
  const isLevel4 = levelNumber >= 4;
  const isExpandingThis = loadingStates.expandingNodeId === nodeId;
  const isAffected = isAlternate && selectedNode.alternateImpact?.affected === true;

  const titleText = safeString(selectedNode.label || selectedNode.title, 'Consequence Node');
  const domainText = safeString(selectedNode.domain || selectedNode.category, 'General');

  // Derive quantitative metrics for graphical charts
  const rawProb = selectedNode.probability ? Number(selectedNode.probability) : 0.85;
  const probPercent = Math.round(rawProb * 100);

  const rawImpact = selectedNode.impactScore ?? selectedNode.impact;
  const impactNum = typeof rawImpact === 'number' ? rawImpact : parseFloat(rawImpact) || 7.5;
  const impactPercent = Math.min(100, Math.max(10, Math.round((impactNum / 10) * 100)));

  const feasibilityPercent = selectedNode.feasibilityScore ?? (100 - impactPercent + 20 > 90 ? 88 : Math.max(45, 100 - Math.round(impactPercent * 0.6)));
  const riskPercent = selectedNode.riskScore ?? Math.min(95, Math.max(20, Math.round(impactPercent * 0.9)));
  const opportunityPercent = selectedNode.opportunityScore ?? Math.min(95, Math.max(30, Math.round((probPercent * 0.8) + (feasibilityPercent * 0.3))));

  // Format domain impact bars dataset
  const domainData = [
    { name: 'Technology', value: domainText === 'Technology' ? 88 : 65, color: '#2563EB' },
    { name: 'Economy', value: domainText === 'Economy' ? 92 : 74, color: '#059669' },
    { name: 'Infrastructure', value: domainText === 'Infrastructure' || domainText === 'Transportation' ? 85 : 52, color: '#D97706' },
    { name: 'Policy & Gov', value: domainText === 'Government' ? 90 : 45, color: '#7C3AED' }
  ];

  return (
    <aside className="info-panel-drawer">
      {/* Drawer Header */}
      <div className="info-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mono-label" style={{ color: '#2563EB', fontWeight: 800 }}>GRAPHICAL INSPECTOR</span>
          <span className="mono-label" style={{ backgroundColor: '#DBEAFE', color: '#1E4ED8', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
            DEPTH L{levelNumber}
          </span>
        </div>
        {graphLocked && (
          <span className="mono-label" style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> LOCKED
          </span>
        )}
      </div>

      {/* Drawer Scroll Body */}
      <div className="info-panel-body" ref={panelBodyRef} style={{ gap: '16px' }}>
        
        {/* Node Title & Domain Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ID: {nodeId.substring(0, 14)}...</span>
            <span className="domain-pill domain-pill-technology" style={{ fontSize: '10px' }}>{domainText}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {titleText}
          </h2>
        </div>

        {/* Alternate Impact Alert Card */}
        {isAffected && (
          <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
              <ShieldAlert size={14} color="#DC2626" />
              <span>AFFECTED BY ALTERNATE DECISION</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#B91C1C', lineHeight: 1.4 }}>
              <strong>Effect:</strong> {safeString(selectedNode.alternateImpact?.effectType, 'Modified Domain Risk')}
              <br />
              <strong>Reason:</strong> {safeString(selectedNode.alternateImpact?.reason, 'Cascade effect from alternate policy selection.')}
            </p>
          </div>
        )}

        {/* Graphical Section 1: Animated SVG Score Gauges */}
        <GraphicCard>
          <CardTitle>
            <PieChart size={13} color="#2563EB" />
            <span>PRIMARY IMPACT GAUGES</span>
          </CardTitle>

          <GaugesRow>
            {/* Impact Score SVG Meter */}
            <GaugeContainer>
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <AnimatedPath
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={impactPercent > 75 ? '#DC2626' : impactPercent > 50 ? '#D97706' : '#059669'}
                  strokeWidth="3.5"
                  strokeDasharray={`${impactPercent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <GaugeText>
                <span className="score-val" style={{ color: impactPercent > 75 ? '#DC2626' : impactPercent > 50 ? '#D97706' : '#059669' }}>
                  {impactNum}
                </span>
                <span className="score-lbl">IMPACT</span>
              </GaugeText>
            </GaugeContainer>

            {/* Probability SVG Meter */}
            <GaugeContainer>
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <AnimatedPath
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeDasharray={`${probPercent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <GaugeText>
                <span className="score-val" style={{ color: '#2563EB' }}>
                  {probPercent}%
                </span>
                <span className="score-lbl">PROB.</span>
              </GaugeText>
            </GaugeContainer>

            {/* Depth Level Meter */}
            <GaugeContainer>
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <AnimatedPath
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3.5"
                  strokeDasharray={`${levelNumber * 25}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <GaugeText>
                <span className="score-val" style={{ color: '#7C3AED' }}>
                  L{levelNumber}
                </span>
                <span className="score-lbl">DEPTH</span>
              </GaugeText>
            </GaugeContainer>
          </GaugesRow>
        </GraphicCard>

        {/* Graphical Section 2: Animated Domain Cascade Bar Charts */}
        <GraphicCard>
          <CardTitle>
            <BarChart3 size={13} color="#059669" />
            <span>CROSS-DOMAIN CASCADE INTENSITY</span>
          </CardTitle>

          <BarChartList>
            {domainData.map((d, i) => (
              <BarItem key={i}>
                <BarHeader>
                  <span className="bar-label">{d.name}</span>
                  <span className="bar-value" style={{ color: d.color }}>{d.value}%</span>
                </BarHeader>
                <BarTrack>
                  <AnimatedBarFill style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                </BarTrack>
              </BarItem>
            ))}
          </BarChartList>
        </GraphicCard>

        {/* Graphical Section 3: Animated Strategic Score Distribution Metrics */}
        <GraphicCard>
          <CardTitle>
            <Activity size={13} color="#D97706" />
            <span>STRATEGIC SCORE BALANCING</span>
          </CardTitle>

          <MetricsList>
            <MetricRow>
              <MetricInfo>
                <Zap size={13} color="#2563EB" />
                <span>Feasibility Rating</span>
              </MetricInfo>
              <MetricScoreBar>
                <div className="track">
                  <AnimatedBarFill style={{ width: `${feasibilityPercent}%`, backgroundColor: '#2563EB' }} />
                </div>
                <strong>{feasibilityPercent}%</strong>
              </MetricScoreBar>
            </MetricRow>

            <MetricRow>
              <MetricInfo>
                <ShieldCheck size={13} color="#059669" />
                <span>Opportunity Spillover</span>
              </MetricInfo>
              <MetricScoreBar>
                <div className="track">
                  <AnimatedBarFill style={{ width: `${opportunityPercent}%`, backgroundColor: '#059669' }} />
                </div>
                <strong>{opportunityPercent}%</strong>
              </MetricScoreBar>
            </MetricRow>

            <MetricRow>
              <MetricInfo>
                <AlertTriangle size={13} color="#DC2626" />
                <span>Systemic Risk Exposure</span>
              </MetricInfo>
              <MetricScoreBar>
                <div className="track">
                  <AnimatedBarFill style={{ width: `${riskPercent}%`, backgroundColor: '#DC2626' }} />
                </div>
                <strong>{riskPercent}%</strong>
              </MetricScoreBar>
            </MetricRow>
          </MetricsList>
        </GraphicCard>

        {/* Graphical Section 4: Animated Breadcrumb Flowchart Indicator */}
        <GraphicCard style={{ backgroundColor: '#F8FAFC' }}>
          <CardTitle>
            <GitCommit size={13} color="#7C3AED" />
            <span>NODE CASCADE PATHWAY</span>
          </CardTitle>

          <PathFlow>
            <PathNode className="done">Root Decision</PathNode>
            <PathLine className="active" />
            <PathNode className={levelNumber >= 1 ? 'done' : ''}>L1 Trigger</PathNode>
            <PathLine className={levelNumber >= 2 ? 'active' : ''} />
            <PathNode className={levelNumber >= 2 ? 'done' : ''}>L2 Ripple</PathNode>
            <PathLine className={levelNumber >= 3 ? 'active' : ''} />
            <PathNode className="current pulsing">L{levelNumber} Selected</PathNode>
          </PathFlow>
        </GraphicCard>

        {/* Text Details Description */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            CONSEQUENCE DESCRIPTION
          </span>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            {safeString(selectedNode.description, 'Systemic consequence evaluating operational resilience, budget allocation, and policy enforcement across regional networks.')}
          </p>
        </div>

        {/* Node Expansion / Folding Controls */}
        {!isAlternate && (
          <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
            {isLevel4 ? (
              <div style={{ padding: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '11px', color: '#92400E', fontWeight: 700, textAlign: 'center' }}>
                [ LEVEL 4 TERMINAL NODE — MAXIMUM GRAPH DEPTH REACHED ]
              </div>
            ) : selectedNode.expanded ? (
              <button
                className="btn-notion"
                onClick={() => handleFoldNode(nodeId)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  color: '#374151',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ChevronUp size={14} />
                <span>COLLAPSE NODE BRANCH</span>
              </button>
            ) : (
              <button
                className="btn-notion btn-notion-primary"
                onClick={() => handleExpandNode(nodeId)}
                disabled={isExpandingThis}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isExpandingThis ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={14} className="spin" />
                    <span>Expanding Node (L{levelNumber + 1})...</span>
                  </span>
                ) : (
                  <>
                    <TrendingUp size={14} />
                    <span>EXPAND CONSEQUENCE BRANCH &gt;</span>
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

/* Animations Keyframes */
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 4px 14px rgba(37, 99, 235, 0.6); }
  100% { transform: scale(1); box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3); }
`;

const shimmer = keyframes`
  0% { opacity: 0.85; }
  50% { opacity: 1; }
  100% { opacity: 0.85; }
`;

/* Styled Components with Micro-Animations */
const GraphicCard = styled.div`
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
`;

const GaugesRow = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const GaugeContainer = styled.div`
  position: relative;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.08);
  }
`;

const AnimatedPath = styled.path`
  transition: stroke-dasharray 0.85s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease;
`;

const GaugeText = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  .score-val {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 900;
    line-height: 1;
    transition: color 0.4s ease;
  }

  .score-lbl {
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: 800;
    color: #64748B;
    margin-top: 1px;
  }
`;

const BarChartList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BarItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;

  .bar-label {
    color: var(--text-primary);
  }
  .bar-value {
    font-family: var(--font-mono);
    font-weight: 800;
  }
`;

const BarTrack = styled.div`
  width: 100%;
  height: 7px;
  background-color: #F1F5F9;
  border-radius: 10px;
  overflow: hidden;
`;

const AnimatedBarFill = styled.div`
  height: 100%;
  border-radius: 10px;
  transition: width 0.75s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease;
  animation: ${shimmer} 2.5s infinite linear;
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const MetricInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 130px;
`;

const MetricScoreBar = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;

  .track {
    flex: 1;
    height: 6px;
    background-color: #F1F5F9;
    border-radius: 8px;
    overflow: hidden;
  }

  strong {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 800;
    min-width: 32px;
    text-align: right;
    color: var(--text-primary);
  }
`;

const PathFlow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 4px 0;
`;

const PathNode = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 6px;
  background-color: #E2E8F0;
  color: #64748B;

  &.done {
    background-color: #DBEAFE;
    color: #1E4ED8;
  }

  &.current {
    background-color: #2563EB;
    color: #FFFFFF;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  }

  &.pulsing {
    animation: ${pulse} 2s infinite ease-in-out;
  }
`;

const PathLine = styled.div`
  flex: 1;
  height: 2px;
  background-color: #CBD5E1;
  transition: background-color 0.4s ease;

  &.active {
    background-color: #2563EB;
  }
`;
