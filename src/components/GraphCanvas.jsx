import React, { useState, useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { CompactTreeNode } from './CompactTreeNode.jsx';
import { InfoPanel } from './InfoPanel.jsx';
import { AlternateSection } from './AlternateSection.jsx';
import { ConvergenceGraphView } from './ConvergenceGraphView.jsx';
import { VerticalStem, BranchConnector, TreeDefs } from './TreeConnector.jsx';
import { Lock, Layers, GitFork, Loader2, Database, ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Image as ImageIcon, FileCode, Check } from 'lucide-react';
import { downloadGraphAsImage, downloadGraphAsJSON } from '../utils/exportGraph.js';

/**
 * Recursive Tree Branch Renderer
 */
function NodeBranch({ node, allNodes, isAlternate = false, isFirstChild = false, isLastChild = false, isOnlyChild = false }) {
  const { loadingStates } = useGraph();
  const nodeId = node.id || node._id;

  const [showChildren, setShowChildren] = useState(Boolean(node.expanded || isAlternate));
  const [isStemGrowing, setIsStemGrowing] = useState(false);

  const children = allNodes.filter((n) => {
    if (node.childrenIds && Array.isArray(node.childrenIds) && node.childrenIds.length > 0) {
      return node.childrenIds.includes(n.id) || node.childrenIds.includes(n._id);
    }
    return n.parentId === nodeId;
  });

  const isExpanded = node.expanded || isAlternate;
  const isGeneratingBranch = loadingStates.expandingNodeId === nodeId && children.length === 0;

  useEffect(() => {
    if (isExpanded) {
      setIsStemGrowing(true);
      const timer = setTimeout(() => {
        setShowChildren(true);
        setIsStemGrowing(false);
      }, 250);

      return () => clearTimeout(timer);
    } else {
      setShowChildren(false);
      setIsStemGrowing(false);
    }
  }, [isExpanded]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', position: 'relative' }}>
      
      {/* Mathematically Perfect Horizontal Line Connector */}
      {!isOnlyChild && (
        <svg width="100%" height="2" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          {!isFirstChild && <line x1="0" y1="1" x2="50%" y2="1" stroke="var(--tree-connector-color, #D3D3D3)" strokeWidth="2" />}
          {!isLastChild && <line x1="50%" y1="1" x2="100%" y2="1" stroke="var(--tree-connector-color, #D3D3D3)" strokeWidth="2" />}
        </svg>
      )}

      {/* 1. Animated Arrow Stem pointing DOWN to this node (from horizontal branch) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <VerticalStem height={20} isAnimating={isStemGrowing} hasArrow={true} />
      </div>

      {/* 2. Compact Tree Node Card */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <CompactTreeNode node={node} isAlternate={isAlternate} />
      </div>

      {/* 3. Branch Extension Area */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* Stem extending DOWN from parent node */}
          <VerticalStem height={24} isAnimating={isStemGrowing} />

          {/* Loader indicator while expanding branch */}
          {isGeneratingBranch ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#F8F5EE', border: '1px solid var(--border-diorama)', borderRadius: '6px' }}>
              <Loader2 size={14} className="spin" color="var(--diorama-connector)" />
              <span className="mono-label" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Extending Consequence Branch...
              </span>
            </div>
          ) : (
            showChildren && children.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', paddingTop: '0px' }}>
                {children.map((childNode, idx) => (
                  <NodeBranch
                    key={childNode.id || childNode._id}
                    node={childNode}
                    allNodes={allNodes}
                    isAlternate={isAlternate}
                    isFirstChild={idx === 0}
                    isLastChild={idx === children.length - 1}
                    isOnlyChild={children.length === 1}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function GraphCanvas() {
  const { activeView, nodes, decision, alternateState, graphLocked, lockGraph, sessionId } = useGraph();

  const canvasViewportRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Pan & Zoom State
  const [zoomScale, setZoomScale] = useState(0.85);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Export Menu Dropdown State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);

  // Auto-fit view on mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setZoomScale(0.55);
    } else {
      setZoomScale(0.85);
    }
  }, []);

  // Mouse Dragging (Panning)
  const handleMouseDown = (e) => {
    if (e.target.closest('.compact-tree-node') || e.target.closest('.info-panel-drawer') || e.target.closest('.zoom-toolbar') || e.target.closest('button')) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panPos.x,
      y: e.clientY - panPos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - panPos.x,
        y: touch.clientY - panPos.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPanPos({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom Controls
  const zoomIn = () => setZoomScale((prev) => Math.min(1.4, Math.round((prev + 0.15) * 100) / 100));
  const zoomOut = () => setZoomScale((prev) => Math.max(0.25, Math.round((prev - 0.15) * 100) / 100));
  const resetZoom = () => {
    setZoomScale(window.innerWidth < 768 ? 0.55 : 0.95);
    setPanPos({ x: 0, y: 0 });
  };
  const fitView = () => {
    setZoomScale(window.innerWidth < 768 ? 0.45 : 0.85);
    setPanPos({ x: 0, y: 0 });
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoomScale((prev) => Math.min(1.4, Math.max(0.25, Math.round((prev + delta) * 100) / 100)));
  };

  // Export Graph Handler
  const handleExport = async (format) => {
    setExportingFormat(format);
    setIsExportOpen(false);

    if (format === 'json') {
      downloadGraphAsJSON({ decision, nodes: displayNodes, sessionId });
    } else {
      await downloadGraphAsImage({
        format,
        elementId: 'graph-canvas-export-target',
        filename: `ripple_decision_${sessionId || 'graph'}`
      });
    }

    setExportingFormat(null);
  };

  if (activeView === 'convergence_graph') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ConvergenceGraphView />
        <AlternateSection />
      </div>
    );
  }

  const isAlternate = activeView === 'alternate_graph';
  const displayNodes = isAlternate ? alternateState.nodes : nodes;
  const activeTitle = isAlternate
    ? alternateState.alternateDecision?.title || alternateState.alternateDecision?.tagline || 'Alternate Path Analysis'
    : decision || "A government should transition all public-sector vehicles to electric vehicles by 2032.";

  const level1Nodes = displayNodes.filter(
    (n) => (n.graphLevel || n.level) === 1 || n.parentId === null
  );

  const maxLevelReached = Math.max(
    1,
    ...displayNodes.map((n) => n.graphLevel || n.level || 1)
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* SVG Definitions for Arrow Markers */}
      <TreeDefs />
      
      {/* Top Canvas Action & Info Toolbar */}
      <div className="top-canvas-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '65%' }}>
          <div className="mono-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            {isAlternate ? <GitFork size={14} color="var(--diorama-connector)" /> : <Layers size={14} />}
            <span>{isAlternate ? 'ALTERNATE GRAPH' : 'ORIGINAL GRAPH (TREE)'}</span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={activeTitle}
          >
            {activeTitle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Depth Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              DEPTH:
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1, 2, 3, 4].map((lvl) => (
                <span
                  key={lvl}
                  className="mono-label"
                  style={{
                    padding: '1px 5px',
                    fontSize: '10px',
                    backgroundColor: lvl <= maxLevelReached ? 'var(--text-primary)' : '#E8E4D9',
                    color: lvl <= maxLevelReached ? '#F8F5EE' : 'var(--text-muted)',
                    border: '1px solid var(--border-diorama)',
                    fontWeight: 700
                  }}
                >
                  L{lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Lock Graph Button */}
          {!isAlternate && !graphLocked && (
            <button
              className="btn-notion btn-notion-primary"
              onClick={lockGraph}
              style={{ padding: '6px 14px', fontSize: '12px' }}
              title="Lock original graph and activate alternate decision flow"
            >
              <Lock size={13} />
              <span>Lock Graph</span>
            </button>
          )}

          {graphLocked && !isAlternate && (
            <div className="notion-label" style={{ color: '#C62828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} />
              <span>GRAPH LOCKED</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={canvasViewportRef}
        className="graph-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          ref={canvasContainerRef}
          id="graph-canvas-export-target"
          className={`graph-canvas-container ${isDragging ? 'is-dragging' : ''}`}
          style={{
            transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'max-content',
            minWidth: '100%',
            padding: '40px 60px 140px 60px',
            boxSizing: 'border-box'
          }}
        >
          {/* ROOT DECISION NODE */}
          <div className="compact-tree-node root-node-card" style={{ marginBottom: '0px', backgroundColor: '#FFFFFF', borderColor: '#2563EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono-label" style={{ color: '#2563EB', backgroundColor: '#EFF6FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                  ROOT DECISION
                </span>
                <span className="domain-pill domain-pill-technology">Policy Target</span>
              </div>
              <span className="mono-label" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ID: {sessionId || 'Root'}</span>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {activeTitle}
            </h3>
          </div>

          {/* LEVEL 1 -> LEVEL 4 CONSEQUENCE BRANCHES */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
            {level1Nodes.map((l1Node, idx) => (
              <NodeBranch
                key={l1Node.id || l1Node._id}
                node={l1Node}
                allNodes={displayNodes}
                isAlternate={isAlternate}
                isFirstChild={idx === 0}
                isLastChild={idx === level1Nodes.length - 1}
                isOnlyChild={level1Nodes.length === 1}
              />
            ))}
          </div>

        </div>

        {/* FLOATING INTERACTIVE CANVAS ZOOM & EXPORT TOOLBAR */}
        <div className="zoom-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out (-)">
            <ZoomOut size={14} />
          </button>
          
          <span className="mono-label" style={{ fontSize: '11px', padding: '0 6px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {Math.round(zoomScale * 100)}%
          </span>

          <button className="zoom-btn" onClick={zoomIn} title="Zoom In (+)">
            <ZoomIn size={14} />
          </button>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-diorama)', margin: '0 2px' }} />

          <button className="zoom-btn" onClick={fitView} title="Fit View">
            <Maximize2 size={13} />
            <span>Fit</span>
          </button>

          <button className="zoom-btn" onClick={resetZoom} title="Reset (100%)">
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-diorama)', margin: '0 2px' }} />

          {/* Export Graph Dropdown Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              className="zoom-btn"
              onClick={() => setIsExportOpen(!isExportOpen)}
              disabled={Boolean(exportingFormat)}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderColor: '#1D4ED8',
                fontWeight: 700,
                padding: '4px 10px'
              }}
              title="Download Graph Canvas as Image (PNG, JPEG, SVG) or JSON"
            >
              {exportingFormat ? (
                <>
                  <Loader2 size={13} className="spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Export Graph</span>
                </>
              )}
            </button>

            {/* Export Format Dropdown Menu */}
            {isExportOpen && (
              <div
                className="no-export"
                style={{
                  position: 'absolute',
                  bottom: '36px',
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '170px',
                  zIndex: 9999
                }}
              >
                <div className="mono-label" style={{ fontSize: '9px', color: '#64748B', padding: '4px 8px', fontWeight: 800 }}>
                  EXPORT GRAPH AS:
                </div>

                <button
                  className="btn-notion"
                  onClick={() => handleExport('png')}
                  style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px', gap: '8px' }}
                >
                  <ImageIcon size={13} color="#2563EB" />
                  <span>PNG Image (.png)</span>
                </button>

                <button
                  className="btn-notion"
                  onClick={() => handleExport('jpeg')}
                  style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px', gap: '8px' }}
                >
                  <ImageIcon size={13} color="#059669" />
                  <span>JPEG Image (.jpg)</span>
                </button>

                <button
                  className="btn-notion"
                  onClick={() => handleExport('svg')}
                  style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px', gap: '8px' }}
                >
                  <FileCode size={13} color="#7C3AED" />
                  <span>SVG Vector (.svg)</span>
                </button>

                <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0' }} />

                <button
                  className="btn-notion"
                  onClick={() => handleExport('json')}
                  style={{ justifyContent: 'flex-start', padding: '6px 10px', fontSize: '12px', gap: '8px' }}
                >
                  <Database size={13} color="#D97706" />
                  <span>JSON Dataset (.json)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Drawer */}
        <InfoPanel isAlternate={isAlternate} />
      </div>

      {/* Alternate Section Carousel Drawer */}
      <AlternateSection />

    </div>
  );
}
