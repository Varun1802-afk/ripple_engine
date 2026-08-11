import React, { useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { useSession } from '../store/SessionContext.jsx';
import { initiateFirstLevelWorkflow, createDecision } from '../api/decisionApi.js';
import { Sparkles, Database, ArrowRight, Play, Server, Layers, Command, Check, ChevronDown, ChevronUp } from 'lucide-react';
import StickerDrag from './StickerDrag.jsx';

const PRESET_DECISION_CARDS = [
  {
    title: 'Public Vehicle Fleet Electrification 2032',
    prompt: 'A government should transition all public-sector vehicles to electric vehicles by 2032, while providing subsidies for charging infrastructure and workforce reskilling.',
    category: 'Government & Transport'
  },
  {
    title: 'Universal Basic Income Implementation',
    prompt: 'Implement a universal basic income of $1,000/month funded through a 2% automation tax and carbon pricing.',
    category: 'Economics & Labor'
  },
  {
    title: 'Mandatory AI Safety Standards for Tech Companies',
    prompt: 'Enact strict federal regulations requiring tech companies to undergo third-party auditing before deploying Frontier AI models.',
    category: 'Technology & Regulation'
  }
];

export function DecisionInput() {
  const { sessionId, updateSessionId } = useSession();
  const { setActiveView, setDecision, setGraphId, loadExistingSession, loadingStates, theme } = useGraph();

  // Mode: 'new' | 'existing'
  const [inputMode, setInputMode] = useState('new');

  // New Decision Form State
  const [customPrompt, setCustomPrompt] = useState('');

  // Existing Session ID Form State
  const [targetSessionId, setTargetSessionId] = useState(sessionId || '1786263972176-q2ibfuaj');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Submit Handler for New Decision
  const handleInitiateNewWorkflow = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const finalDecisionText = customPrompt.trim() || PRESET_DECISION_CARDS[0].prompt;

    setIsSubmitting(true);

    // 60-second timeout promise (1 minute)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Resources could not be loaded. Workflow server took more than 1 minute to respond.')), 60000)
    );

    try {
      setDecision(finalDecisionText);

      // 1. Send POST request to n8n webhook with 60s timeout race
      const webhookRes = await Promise.race([
        initiateFirstLevelWorkflow({ decision: finalDecisionText }),
        timeoutPromise
      ]);

      // 2. Strictly DO NOT show the graph until a valid sessionId is received!
      if (webhookRes.success && webhookRes.sessionId) {
        console.log("💾 Received valid sessionId from webhook:", webhookRes.sessionId);
        updateSessionId(webhookRes.sessionId);
        if (setGraphId) setGraphId(webhookRes.sessionId);
        setActiveView('original_graph');
      } else {
        console.warn("⚠️ Webhook did not return a valid sessionId:", webhookRes);
        setErrorMessage(webhookRes.error || "Resources could not be loaded. No valid sessionId received from workflow server.");
      }
    } catch (err) {
      console.error('Failed to initiate decision workflow:', err);
      setErrorMessage(err.message || 'Resources could not be loaded. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler for Existing Session ID (Direct DB fetch, no workflows)
  const handleFetchExistingSession = async (e) => {
    if (e) e.preventDefault();
    const cleanId = targetSessionId.trim();
    if (!cleanId) return;

    updateSessionId(cleanId);
    await loadExistingSession(cleanId);
  };

  // Presets Accordion State
  const [isPresetsOpen, setIsPresetsOpen] = useState(true);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px clamp(16px, 5vw, 120px)',
        overflowY: 'auto',
        minHeight: '100%',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '720px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Originkit 4 Draggable WebGL Sticker Components using User Blank Transparent PNGs */}
        {/* 1. Top-Left Dusty Pink Sticker */}
        <StickerDrag
          image="/sticky_note_blank_pink-removebg-preview.png"
          initialText="Good! Redesign the button"
          imageWidth={295}
          imageHeight={280}
          tilt={35}
          elevation={10}
          style={{
            position: 'absolute',
            top: '-20px',
            left: '-310px',
            zIndex: 30
          }}
        />

        {/* 2. Bottom-Left Coral Orange Sticker */}
        <StickerDrag
          image="/sticky_note_blank_orange-removebg-preview.png"
          initialText="This needs to be done ASAP"
          imageWidth={295}
          imageHeight={280}
          tilt={35}
          elevation={10}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '-320px',
            zIndex: 30
          }}
        />

        {/* 3. Top-Right Sunny Yellow Sticker */}
        <StickerDrag
          image="/sticky_note_blank_yellow-Photoroom.png"
          initialText="Keep track of critical details"
          imageWidth={295}
          imageHeight={280}
          tilt={35}
          elevation={10}
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-310px',
            zIndex: 30
          }}
        />

        {/* 4. Bottom-Right Periwinkle Blue Sticker */}
        <StickerDrag
          image="/sticky_note_blank_blue-Photoroom.png"
          initialText="Pay attention to details"
          imageWidth={295}
          imageHeight={280}
          tilt={35}
          elevation={10}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '-320px',
            zIndex: 30
          }}
        />
        {/* Pure CSS 3D Paper Cutout Layered Badge Accent */}
        {theme === 'diorama' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-4px' }}>
            <div
              className="paper-diorama-badge-layers"
              style={{
                position: 'relative',
                width: '260px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Back Layer Paper Arch */}
              <div style={{
                position: 'absolute',
                top: 0,
                width: '240px',
                height: '50px',
                backgroundColor: '#EADCCE',
                borderRadius: '30px 30px 0 0',
                boxShadow: '0 4px 10px rgba(80, 50, 25, 0.12)',
                zIndex: 1
              }} />
              {/* Middle Layer Paper Foilage Arch */}
              <div style={{
                position: 'absolute',
                top: '12px',
                width: '220px',
                height: '48px',
                backgroundColor: '#137333',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 6px 14px rgba(80, 50, 25, 0.16)',
                zIndex: 2,
                opacity: 0.9
              }} />
              {/* Foreground Paper Badge Card */}
              <div style={{
                position: 'absolute',
                top: '20px',
                padding: '6px 20px',
                backgroundColor: '#FFFDF9',
                border: '1px solid #D8CBB7',
                borderRadius: '20px',
                boxShadow: '0 8px 18px rgba(80, 50, 25, 0.18)',
                zIndex: 3,
                fontSize: '11px',
                fontWeight: 700,
                color: '#4A331E',
                letterSpacing: '0.05em'
              }}>
                🎨 3D LAYERED PAPER DIORAMA
              </div>
            </div>
          </div>
        )}

        {/* Large Heading Section */}
        <div style={{ textAlign: 'center' }}>
          <div className="mono-label" style={{ color: '#64748B', marginBottom: '6px', fontWeight: 700 }}>
            {theme === 'diorama' ? '🎨 3D PAPER CRAFT DIORAMA MODE' : '📐 ERASER.IO TECHNICAL DIAGRAM MODE'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0F172A',
              margin: 0
            }}
          >
            Enter Proposed Policy or Strategic Decision
          </h1>
        </div>

        {/* Dual Mode Toggle Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            className="doodle-submit-btn"
            onClick={() => setInputMode('new')}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px 18px',
              backgroundColor: inputMode === 'new' ? 'var(--accent-mint)' : '#FDFBF7'
            }}
          >
            <Sparkles size={14} />
            <span>Simulate New Decision</span>
          </button>

          <button
            type="button"
            className="doodle-submit-btn"
            onClick={() => setInputMode('existing')}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px 18px',
              backgroundColor: inputMode === 'existing' ? 'var(--accent-yellow)' : '#FDFBF7'
            }}
          >
            <Database size={14} />
            <span>Load Existing Session ID</span>
          </button>
        </div>

        {/* MODE A: SIMULATE NEW DECISION */}
        {inputMode === 'new' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Hand-Drawn Doodle Notebook Decision Input Card */}
            <form onSubmit={handleInitiateNewWorkflow} className="doodle-notebook-card">
              {/* Paper Washi Tape Corner */}
              <div className="doodle-tape" />

              {/* Decorative SVG Doodles */}
              <svg className="doodle-svg star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" />
              </svg>
              <svg className="doodle-svg sparkle" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z" />
              </svg>
              <svg className="doodle-svg swirl" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50C90 32.3 75.7 18 58 18C44.3 18 33 29.3 33 43C33 53.5 41.5 62 52 62C59.7 62 66 55.7 66 48" />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 2 }}>
                <span className="doodle-title-badge">
                  PROPOSED DECISION STATEMENT
                </span>
                <span className="doodle-session-badge">
                  ACTIVE SESSION: {sessionId}
                </span>
              </div>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. A government should transition all public-sector vehicles to electric vehicles by 2032..."
                rows={4}
                className="doodle-textarea"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 2, flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#555555' }}>
                  * Submitting will initiate multi-agent consequence workflows on Railway backend.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || loadingStates.isGenerating}
                  className="doodle-submit-btn"
                >
                  {isSubmitting || loadingStates.isGenerating ? (
                    <span>Initiating Workflows...</span>
                  ) : (
                    <>
                      <span>INITIATE WORKFLOWS</span>
                      <Play size={14} />
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: '8px', color: '#DC2626', fontSize: '12px', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                  ⚠️ {errorMessage}
                </div>
              )}
            </form>
          </div>
        )}

        {/* MODE B: LOAD EXISTING SESSION ID */}
        {inputMode === 'existing' && (
          <form onSubmit={handleFetchExistingSession} className="doodle-notebook-card">
            {/* Paper Washi Tape Corner */}
            <div className="doodle-tape" />

            {/* Decorative SVG Doodles */}
            <svg className="doodle-svg star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" />
            </svg>
            <svg className="doodle-svg sparkle" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 2 }}>
              <span className="doodle-title-badge" style={{ backgroundColor: 'var(--accent-yellow)' }}>
                LOAD EXISTING SESSION ID
              </span>
            </div>

            <p style={{ fontSize: '13px', color: '#2C2C2C', margin: 0, lineHeight: 1.5, zIndex: 2, textAlign: 'left', width: '100%', fontWeight: 600 }}>
              Enter an existing Session ID to fetch previously generated graph nodes directly from the Railway MongoDB database without triggering new AI workflow runs.
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%', zIndex: 2 }}>
              <input
                type="text"
                value={targetSessionId}
                onChange={(e) => setTargetSessionId(e.target.value)}
                placeholder="Enter Session ID (e.g. 1786263972176-q2ibfuaj)"
                className="doodle-textarea"
                style={{ height: '48px', padding: '10px 14px' }}
              />

              <button
                type="submit"
                disabled={loadingStates.isGenerating || !targetSessionId.trim()}
                className="doodle-submit-btn"
                style={{ backgroundColor: 'var(--accent-lavender)' }}
              >
                {loadingStates.isGenerating ? (
                  <span>Fetching DB...</span>
                ) : (
                  <>
                    <span>FETCH SESSION</span>
                    <Server size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, width: '100%', flexWrap: 'wrap' }}>
              <span className="doodle-session-badge">
                DEMO SESSION ID:
              </span>
              <button
                type="button"
                className="doodle-submit-btn"
                onClick={() => setTargetSessionId('1786263972176-q2ibfuaj')}
                style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#FDFBF7' }}
              >
                1786263972176-q2ibfuaj
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
