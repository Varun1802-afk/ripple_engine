import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { X, Sparkles, RefreshCw, Cpu, Award, CheckCircle2, Info, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

/* 21st.dev Alert Icons & Trend Indicators */
const DiamondAlertIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.92844 1.25411C9.32947 1.25895 8.73263 1.49041 8.28293 1.94747L1.92062 8.41475C1.02123 9.32885 1.03336 10.8178 1.94748 11.7172L8.41476 18.0795C9.32886 18.9789 10.8178 18.9667 11.7172 18.0526L18.0795 11.5861C18.0798 11.5859 18.08 11.5856 18.0803 11.5853C18.979 10.6708 18.9667 9.18232 18.0526 8.28291L11.5853 1.92061C11.1283 1.47091 10.5274 1.24926 9.92844 1.25411ZM9.93901 2.49597C10.2155 2.49373 10.4926 2.59892 10.7089 2.81172L17.1762 9.17403C17.6087 9.59962 17.6139 10.2767 17.1884 10.7097L10.8261 17.1761C10.4005 17.6087 9.72379 17.614 9.29123 17.1884L2.82394 10.826C2.39139 10.4005 2.38613 9.72378 2.81174 9.29121L9.17404 2.82393C9.38684 2.60765 9.66256 2.4982 9.93901 2.49597Z" fill="#5B14C5" />
  </svg>
);

const CircleAlertIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.0001 1.66663C5.40511 1.66663 1.66675 5.40499 1.66675 9.99996C1.66675 14.5949 5.40511 18.3333 10.0001 18.3333C14.5951 18.3333 18.3334 14.5949 18.3334 9.99996C18.3334 5.40499 14.5951 1.66663 10.0001 1.66663Z" fill="#3B82F6" />
  </svg>
);

const TriangleAlertIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.0001 2.10535C9.35241 2.10535 8.70472 2.42118 8.35459 3.05343L1.90440 14.7063C1.22414 15.9354 2.14514 17.5000 3.54990 17.5000H16.4511C17.8559 17.5000 18.7769 15.9354 18.0966 14.7063L11.6456 3.05343C11.2955 2.42118 10.6478 2.10535 10.0001 2.10535Z" fill="#E84045" />
  </svg>
);

const UpTrendIcon = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.4" />
    <path d="M9.50134 12.6111L14.0013 8.16663M14.0013 8.16663L18.5013 12.6111M14.0013 8.16663L14.0013 19.8333" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const DownTrendIcon = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.4" />
    <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export function ConclusionModal({ isOpen, onClose, conclusionData, isLoading, errorMessage, onRetry, decision }) {
  if (!isOpen) return null;

  const data = conclusionData || {};
  const score = data.overallScore || 82;

  const LEGEND_ITEMS = [
    { name: 'Technology', color: '#5B14C5' },
    { name: 'Economy', color: '#B58BF3' },
    { name: 'Policy & Risk', color: '#DAC5F9' }
  ];

  const getOutlookBadge = (outlook) => {
    switch (String(outlook).toLowerCase()) {
      case 'positive':
        return { label: 'POSITIVE OUTLOOK', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0', icon: <CheckCircle2 size={13} /> };
      case 'mixed':
        return { label: 'MIXED OUTLOOK', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', icon: <Info size={13} /> };
      case 'negative':
        return { label: 'NEGATIVE OUTLOOK', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', icon: <AlertTriangle size={13} /> };
      default:
        return { label: 'UNCERTAIN OUTLOOK', color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE', icon: <Info size={13} /> };
    }
  };

  const getRecommendationBadge = (rec) => {
    switch (String(rec).toLowerCase()) {
      case 'proceed':
        return { label: 'PROCEED WITH EXECUTION', color: '#047857', bg: '#ECFDF5', border: '#10B981' };
      case 'proceed_with_caution':
        return { label: 'PROCEED WITH CAUTION', color: '#1E4ED8', bg: '#EFF6FF', border: '#3B82F6' };
      case 'reconsider':
        return { label: 'RECONSIDER POLICY', color: '#B91C1C', bg: '#FEF2F2', border: '#EF4444' };
      default:
        return { label: 'INSUFFICIENT INFORMATION', color: '#4B5563', bg: '#F3F4F6', border: '#9CA3AF' };
    }
  };

  const outlookInfo = getOutlookBadge(data.outlook || 'positive');
  const recInfo = getRecommendationBadge(data.recommendation || 'proceed_with_caution');

  const feasibilityVal = Math.min(95, Math.max(50, score + 6));
  const riskVal = Math.max(20, Math.min(80, 100 - score + 15));
  const opportunityVal = Math.min(96, Math.max(40, score - 5));

  const METRICS_LIST = [
    {
      id: 'score',
      Icon: DiamondAlertIcon,
      label: 'Strategic Evaluation Score',
      value: `${score} / 100`,
      TrendIcon: UpTrendIcon,
      trendBaseColor: '#40E5D1',
      trendStrokeColor: '#40E5D1',
      delay: 0
    },
    {
      id: 'feasibility',
      Icon: CircleAlertIcon,
      label: 'Feasibility & Operational Rating',
      value: `${feasibilityVal}%`,
      TrendIcon: UpTrendIcon,
      trendBaseColor: '#3B82F6',
      trendStrokeColor: '#60A5FA',
      delay: 0.05
    },
    {
      id: 'risk',
      Icon: TriangleAlertIcon,
      label: 'Systemic Risk Exposure',
      value: `${riskVal}%`,
      TrendIcon: DownTrendIcon,
      trendBaseColor: '#E84045',
      trendStrokeColor: '#F08083',
      delay: 0.1
    }
  ];

  return (
    <ModalBackdrop onClick={onClose}>
      {/* 21st.dev Theme Styled Card Container */}
      <DevCardContainer onClick={(e) => e.stopPropagation()}>
        
        {/* Header Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 12px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: '#5B14C5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#FFFFFF" />
            </div>
            <div>
              <span className="mono-label" style={{ fontSize: '10px', color: '#5B14C5', fontWeight: 800, letterSpacing: '0.05em' }}>
                SWYTCHCODE AI AGENT // STRATEGIC DECISION REPORT
              </span>
              <h3 className="text-2xl font-bold text-black dark:text-white" style={{ margin: 0, fontSize: '20px', lineHeight: 1.2 }}>
                Strategic Decision Conclusion
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', backgroundColor: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close Conclusion Modal"
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '0 28px 24px 28px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px' }}>
              <RefreshCw size={28} className="spin" color="#5B14C5" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                Executing Swytchcode reasoning runtime...
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', maxWidth: '360px' }}>
                Validating payload against <code style={{ fontWeight: 700 }}>.swytchcode/tooling.json</code> and synthesizing multi-tier consequence branches.
              </span>
            </div>
          ) : errorMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '10px', backgroundColor: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: '16px' }}>
              <AlertTriangle size={24} color="#DC2626" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                {errorMessage}
              </span>
              <button
                onClick={onRetry}
                style={{ marginTop: '8px', padding: '8px 18px', fontSize: '12px', gap: '6px', backgroundColor: '#DC2626', color: '#FFF', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Retry Decision Conclusion
              </button>
            </div>
          ) : (
            <>
              {/* Target Decision Statement */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <span className="mono-label" style={{ fontSize: '10px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 800 }}>
                  TARGET DECISION STATEMENT
                </span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.45 }}>
                  "{decision || 'Strategic Policy & Consequence Analysis'}"
                </p>
              </div>

              {/* Legend & Badges Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {LEGEND_ITEMS.map((item) => (
                    <div key={item.name} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{item.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <BadgePill style={{ color: outlookInfo.color, backgroundColor: outlookInfo.bg, borderColor: outlookInfo.border }}>
                    {outlookInfo.icon}
                    <span>{outlookInfo.label}</span>
                  </BadgePill>

                  <BadgePill style={{ color: recInfo.color, backgroundColor: recInfo.bg, borderColor: recInfo.border }}>
                    <Award size={13} />
                    <span>{recInfo.label}</span>
                  </BadgePill>
                </div>
              </div>

              {/* 21st.dev Area Chart Gradient Graphic Section */}
              <ChartGraphicBox>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="mono-label" style={{ fontSize: '10px', color: '#5B14C5', fontWeight: 800 }}>
                    MULTI-TIER CONFLICT & METRIC CASCADE (REAVIZ DYNAMICS)
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#5B14C5' }}>{score}% SCORE</span>
                </div>

                <svg width="100%" height="110" viewBox="0 0 400 110" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B14C5" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#5B14C5" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B58BF3" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#B58BF3" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area Series 3 */}
                  <path d="M 0 90 Q 60 70, 120 85 T 240 60 T 360 75 L 400 65 L 400 110 L 0 110 Z" fill="url(#grad3)" />
                  <path d="M 0 90 Q 60 70, 120 85 T 240 60 T 360 75 L 400 65" fill="none" stroke="#3B82F6" strokeWidth="2" />

                  {/* Area Series 2 */}
                  <path d="M 0 75 Q 70 45, 140 60 T 280 40 T 360 50 L 400 35 L 400 110 L 0 110 Z" fill="url(#grad2)" />
                  <path d="M 0 75 Q 70 45, 140 60 T 280 40 T 360 50 L 400 35" fill="none" stroke="#B58BF3" strokeWidth="2.5" />

                  {/* Area Series 1 */}
                  <path d="M 0 60 Q 80 25, 160 45 T 260 20 T 360 30 L 400 15 L 400 110 L 0 110 Z" fill="url(#grad1)" />
                  <path d="M 0 60 Q 80 25, 160 45 T 260 20 T 360 30 L 400 15" fill="none" stroke="#5B14C5" strokeWidth="3" />
                </svg>
              </ChartGraphicBox>

              {/* 21st.dev Animated Metrics Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                {METRICS_LIST.map((metric) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: metric.delay, duration: 0.3 }}
                    style={{ display: 'flex', width: '100%', padding: '10px 0', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '60%', color: '#64748B', fontSize: '12px', fontWeight: 600 }}>
                      <metric.Icon />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {metric.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '40%', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{metric.value}</span>
                      <metric.TrendIcon baseColor={metric.trendBaseColor} strokeColor={metric.trendStrokeColor} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Executive Summary */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <span className="mono-label" style={{ fontSize: '10px', color: '#5B14C5', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                  EXECUTIVE REASONING SUMMARY
                </span>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  {data.summary || 'Strategic analysis demonstrates solid multi-domain gains across core policy metrics.'}
                </p>
              </div>

              {/* Key Benefits vs Key Risks Grid Cards */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <CardBox style={{ borderLeft: '4px solid #059669', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ShieldCheck size={14} color="#059669" />
                    <span className="mono-label" style={{ fontSize: '10px', color: '#047857', fontWeight: 800 }}>
                      KEY BENEFITS
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: '#1E293B', lineHeight: 1.45 }}>
                    {(data.keyBenefits || []).map((b, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{b}</li>
                    ))}
                  </ul>
                </CardBox>

                <CardBox style={{ borderLeft: '4px solid #DC2626', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ShieldAlert size={14} color="#DC2626" />
                    <span className="mono-label" style={{ fontSize: '10px', color: '#B91C1C', fontWeight: 800 }}>
                      KEY RISKS
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: '#1E293B', lineHeight: 1.45 }}>
                    {(data.keyRisks || []).map((r, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                    ))}
                  </ul>
                </CardBox>
              </div>

              {/* Swytchcode Trust Boundary Footer */}
              <SwytchcodeFooter>
                <Cpu size={14} color="#5B14C5" />
                <span>
                  Executed via Swytchcode Integration <code style={{ fontWeight: 800, color: '#5B14C5' }}>openai.chat.completions.create</code> (Trust Boundary: <code style={{ fontWeight: 700 }}>.swytchcode/tooling.json</code>)
                </span>
              </SwytchcodeFooter>
            </>
          )}
        </div>

      </DevCardContainer>
    </ModalBackdrop>
  );
}

/* Styled Components */
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  animation: fadeIn 0.25s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DevCardContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 24px;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    11px 21px 3px rgba(0,0,0,0.06),
    14px 27px 7px rgba(0,0,0,0.10),
    19px 38px 14px rgba(0,0,0,0.13),
    27px 54px 27px rgba(0,0,0,0.16),
    39px 78px 50px rgba(0,0,0,0.20),
    55px 110px 86px rgba(0,0,0,0.26);
  overflow: hidden;
  border: 1px solid #E2E8F0;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes scaleUp {
    from { transform: scale(0.95) translateY(10px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
`;

const BadgePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const ChartGraphicBox = styled.div`
  background-color: #FAF5FF;
  border: 1px solid #F3E8FF;
  border-radius: 16px;
  padding: 14px;
  overflow: hidden;
`;

const CardBox = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
`;

const SwytchcodeFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: #FAF5FF;
  border: 1px solid #F3E8FF;
  border-radius: 12px;
  font-size: 11px;
  color: #5B14C5;
`;
