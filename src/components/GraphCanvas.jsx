import React, { useState, useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { CompactTreeNode } from './CompactTreeNode.jsx';
import { InfoPanel } from './InfoPanel.jsx';
import { AlternateSection } from './AlternateSection.jsx';
import { ConvergenceGraphView } from './ConvergenceGraphView.jsx';
import { VerticalStem, BranchConnector, TreeDefs } from './TreeConnector.jsx';
import { Lock, Layers, GitFork, Loader2, Database, ZoomIn, ZoomOut, Maximize2, RotateCcw, Box } from 'lucide-react';

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

      {/* 2. Ultra-Compact Physical Stackable Paper Card (145px width) */}
      <CompactTreeNode node={node} isAlternate={isAlternate} />

      {/* 2. Inline Async Database Loading State */}
      {isGeneratingBranch && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
          <VerticalStem height={20} isAnimating={true} />
          <div
            className="notion-node-card"
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-secondary)',
              borderStyle: 'dashed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Loader2 size={12} className="spin" color="var(--diorama-connector)" />
            <Database size={11} />
            <span>Generating child consequences in DB...</span>
          </div>
        </div>
      )}

      {/* 3. Render organic root stem & child branch */}
      {isExpanded && (children.length > 0 || isStemGrowing) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <BranchConnector childCount={children.length} isAnimating={isStemGrowing} />

          {/* Child nodes reveal after root stem extends */}
          {showChildren && children.length > 0 && (
            <div
              className="children-reveal-animated"
              style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}
            >
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
          )}
        </div>
      )}
    </div>
  );
}

export function GraphCanvas() {
  const {
    activeView,
    decision,
    nodes,
    graphLocked,
    lockGraph,
    alternateState,
    loadingStates,
    selectedNode
  } = useGraph();

  // Zoom & Pan State
  const [zoomScale, setZoomScale] = useState(0.95);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasViewportRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Smooth scroll centering on node expansion
  useEffect(() => {
    if (selectedNode && canvasContainerRef.current) {
      const container = canvasContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight / 3,
        behavior: 'smooth'
      });
    }
  }, [loadingStates.expandingNodeId, selectedNode?.expanded]);

  // Pan Handlers
  const handleMouseDown = (e) => {
    if (
      e.target.closest('.notion-node-card') ||
      e.target.closest('.info-panel-drawer') ||
      e.target.closest('.zoom-toolbar') ||
      e.target.closest('.top-canvas-toolbar') ||
      e.target.closest('.notion-header')
    ) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
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

  // Zoom Controls
  const zoomIn = () => setZoomScale((prev) => Math.min(1.4, Math.round((prev + 0.1) * 10) / 10));
  const zoomOut = () => setZoomScale((prev) => Math.max(0.4, Math.round((prev - 0.1) * 10) / 10));
  const resetZoom = () => {
    setZoomScale(0.95);
    setPanPos({ x: 0, y: 0 });
  };
  const fitView = () => {
    setZoomScale(0.85);
    setPanPos({ x: 0, y: 0 });
  };

  // Wheel Zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoomScale((prev) => Math.min(1.4, Math.max(0.4, Math.round((prev + delta) * 100) / 100)));
    }
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
    : decision || "A government should transition all public-sector vehicles to electric vehicles by 2032, while providing subsidies for charging infrastructure and workforce reskilling.";

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
        onWheel={handleWheel}
      >
        <div
          ref={canvasContainerRef}
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
            padding: '40px 60px',
            boxSizing: 'border-box'
          }}
        >
          {/* --- 1. ROOT DECISION CARD --- */}
          <div className="root-decision-node">
            <div className="notion-label" style={{ marginBottom: '6px' }}>
              ROOT DECISION OBJECTIVE
            </div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, lineHeight: 1.45, margin: 0 }}>
              {activeTitle}
            </h3>
          </div>

          {/* Continuous Tree Branch Connector from ROOT directly to Level 1 nodes */}
          <BranchConnector childCount={level1Nodes.length} isAnimating={false} />

          {/* --- 2. LEVEL 1 BRANCHES ROW (Centered & Seamlessly Connected) --- */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', minWidth: 'min-content', margin: '0 auto', position: 'relative' }}>
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

        {/* FLOATING INTERACTIVE CANVAS ZOOM TOOLBAR */}
        <div className="zoom-toolbar">
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out (-)">
            <ZoomOut size={14} />
          </button>
          
          <span className="mono-label" style={{ fontSize: '11px', padding: '0 6px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {Math.round(zoomScale * 100)}%
          </span>

          <button className="zoom-btn" onClick={zoomIn} title="Zoom In (+)">
            <ZoomIn size={14} />
          </button>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-diorama)', margin: '0 4px' }} />

          <button className="zoom-btn" onClick={fitView} title="Fit View">
            <Maximize2 size={13} />
            <span>Fit</span>
          </button>

          <button className="zoom-btn" onClick={resetZoom} title="Reset (100%)">
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Right Info Drawer */}
        <InfoPanel isAlternate={isAlternate} />
      </div>

      {/* Alternate Section Carousel Drawer */}
      <AlternateSection />

    </div>
  );
}
