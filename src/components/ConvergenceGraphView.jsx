import React, { useState, useEffect } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { CompactTreeNode } from './CompactTreeNode.jsx';
import { MOCK_CONVERGENCE_GRAPH } from '../data/mockData.js';
import { Network, ZoomIn, ZoomOut, RotateCcw, Grab, LayoutGrid, Info } from 'lucide-react';

const safeString = (val, fallback = '') => {
  if (!val || val === 'undefined' || val === 'null') return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
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
  const { convergenceState, nodes, alternateState } = useGraph();
  
  // Canvas Pan & Zoom State
  const [zoomScale, setZoomScale] = useState(0.85);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });

  // Individual Node Dragging State
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [nodeOffset, setNodeOffset] = useState({ x: 0, y: 0 });

  // Interactive Relationship Hover Popover State
  const [hoveredRelIndex, setHoveredRelIndex] = useState(null);

  const rawData = convergenceState.data || MOCK_CONVERGENCE_GRAPH;
  const data = typeof rawData === 'object' && rawData !== null ? rawData : MOCK_CONVERGENCE_GRAPH;

  // Extract raw convergence links (fromNodeId -> toNodeId)
  let rawLinks = [];
  if (Array.isArray(data)) {
    rawLinks = data;
  } else if (Array.isArray(data.convergence)) {
    rawLinks = data.convergence;
  } else if (Array.isArray(data.relationships)) {
    rawLinks = data.relationships;
  } else if (Array.isArray(data.data)) {
    rawLinks = data.data;
  } else if (Array.isArray(data.matrix)) {
    rawLinks = data.matrix;
  } else if (Array.isArray(data.edges)) {
    rawLinks = data.edges;
  }

  // Fallback to MOCK_CONVERGENCE_GRAPH relationships if data array is empty
  if (rawLinks.length === 0 && Array.isArray(MOCK_CONVERGENCE_GRAPH.convergence)) {
    rawLinks = MOCK_CONVERGENCE_GRAPH.convergence;
  } else if (rawLinks.length === 0 && Array.isArray(MOCK_CONVERGENCE_GRAPH.relationships)) {
    rawLinks = MOCK_CONVERGENCE_GRAPH.relationships;
  }

  const allKnownNodes = [...(nodes || []), ...(alternateState.nodes || [])];

  const resolveNodeDetails = (nodeId) => {
    if (!nodeId) return { id: 'node_unknown', label: 'Consequence Node', graphLevel: 1, domain: 'General' };
    const strId = String(nodeId);

    const found = allKnownNodes.find((n) => String(n.id) === strId || String(n._id) === strId || String(n.nodeId) === strId);
    if (found) {
      return {
        ...found,
        id: strId,
        label: safeString(found.label || found.title || found.name, 'Consequence Node'),
        graphLevel: Number(found.graphLevel || found.level || 1),
        domain: safeString(found.domain || found.category, 'General')
      };
    }

    if (strId.includes('_node1')) {
      return { id: strId, label: 'Root Foundational Consequence (Node 1)', graphLevel: 1, domain: 'Government' };
    }
    if (strId.includes('_node2')) {
      return { id: strId, label: 'Root Foundational Consequence (Node 2)', graphLevel: 1, domain: 'Economy' };
    }

    const shortId = strId.replace(/^node_/, '').substring(0, 8);
    return { id: strId, label: `Consequence Node (${shortId})`, graphLevel: 3, domain: 'Impact' };
  };

  // Collect unique node blocks
  const nodeMap = {};
  rawLinks.forEach((link) => {
    const fromId = link.fromNodeId || link.fromNode || link.fromId || link.source;
    const toId = link.toNodeId || link.toNode || link.toId || link.target;
    if (fromId && !nodeMap[fromId]) nodeMap[fromId] = resolveNodeDetails(fromId);
    if (toId && !nodeMap[toId]) nodeMap[toId] = resolveNodeDetails(toId);
  });

  const uniqueNodes = Object.values(nodeMap);

  // Initialize node positions in a clean 3-tier layout grid
  const [nodePositions, setNodePositions] = useState({});

  const autoOrganizeLayout = () => {
    const initialPos = {};

    const l1Nodes = uniqueNodes.filter((n) => (n.graphLevel || 1) === 1);
    const l2Nodes = uniqueNodes.filter((n) => (n.graphLevel || 1) === 2);
    const l3Nodes = uniqueNodes.filter((n) => (n.graphLevel || 1) === 3 || (n.graphLevel || 1) === 4);

    // Row 1: Level 1 Root Nodes (Y = 60px)
    l1Nodes.forEach((node, idx) => {
      initialPos[node.id] = {
        x: 360 + idx * 580,
        y: 60
      };
    });

    // Row 2: Level 2 Intermediate Nodes (Y = 340px)
    l2Nodes.forEach((node, idx) => {
      initialPos[node.id] = {
        x: 180 + idx * 360,
        y: 340
      };
    });

    // Row 3: Level 3/4 Terminal Nodes (Y = 620px)
    l3Nodes.forEach((node, idx) => {
      initialPos[node.id] = {
        x: 140 + idx * 320,
        y: 620
      };
    });

    // Fallback for remaining unpositioned nodes
    uniqueNodes.forEach((node, idx) => {
      if (!initialPos[node.id]) {
        initialPos[node.id] = {
          x: 140 + (idx % 4) * 320,
          y: 620 + Math.floor(idx / 4) * 260
        };
      }
    });

    setNodePositions(initialPos);
    setPanPos({ x: 0, y: 0 });
    setZoomScale(0.85);
  };

  useEffect(() => {
    autoOrganizeLayout();
  }, [rawLinks.length, uniqueNodes.length]);

  // Individual Node Mouse Down Handler (Dragging Individual Node Blocks)
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    const pos = nodePositions[nodeId] || { x: 0, y: 0 };
    setNodeOffset({
      x: (e.clientX / zoomScale) - pos.x,
      y: (e.clientY / zoomScale) - pos.y
    });
  };

  // Canvas Mouse Down Handler (Panning Infinite Canvas)
  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.individual-node-wrapper') || e.target.closest('.zoom-toolbar')) return;
    setIsCanvasDragging(true);
    setCanvasDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };

  // Global Mouse Move Handler
  const handleMouseMove = (e) => {
    if (draggedNodeId) {
      const newX = (e.clientX / zoomScale) - nodeOffset.x;
      const newY = (e.clientY / zoomScale) - nodeOffset.y;
      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: newX, y: newY }
      }));
    } else if (isCanvasDragging) {
      setPanPos({
        x: e.clientX - canvasDragStart.x,
        y: e.clientY - canvasDragStart.y
      });
    }
  };

  // Global Mouse Up Handler
  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsCanvasDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoomScale((prev) => Math.min(1.5, Math.max(0.3, Math.round((prev + delta) * 100) / 100)));
  };

  const zoomIn = () => setZoomScale((prev) => Math.min(1.5, Math.round((prev + 0.15) * 100) / 100));
  const zoomOut = () => setZoomScale((prev) => Math.max(0.3, Math.round((prev - 0.15) * 100) / 100));

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC'
      }}
    >
      {/* SVG Arrow Defs */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <marker
            id="arrow-head-blue"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,8 L8,4 z" fill="#2563EB" />
          </marker>
        </defs>
      </svg>

      {/* Top Header Navigation Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mono-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontWeight: 800 }}>
            <Network size={16} color="#2563EB" />
            <span>CONVERGENCE GRAPH CANVAS</span>
          </div>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Movable Node Blocks & Flexible Joints ({rawLinks.length} Causal Connections Mapped)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-notion btn-notion-primary"
            onClick={autoOrganizeLayout}
            style={{ padding: '6px 12px', fontSize: '11px', gap: '6px', display: 'inline-flex', alignItems: 'center' }}
            title="Snap all nodes back to clean 3-tier organized layout"
          >
            <LayoutGrid size={13} />
            <span>Auto-Align Layout</span>
          </button>
        </div>
      </div>

      {/* Main Large Draggable Viewport */}
      <div
        className="graph-viewport"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          cursor: isCanvasDragging ? 'grabbing' : draggedNodeId ? 'grabbing' : 'grab',
          backgroundColor: '#F8FAFC',
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Movable Infinite Canvas Container */}
        <div
          style={{
            transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
            transformOrigin: 'top left',
            transition: isCanvasDragging || draggedNodeId ? 'none' : 'transform 0.15s ease-out',
            width: '3200px',
            height: '2400px',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          {/* Dynamic Real-time Flexible SVG Joints (Arrow Lines Layer) */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {rawLinks.map((link, idx) => {
              const fromId = String(link.fromNodeId || link.fromNode || link.fromId || link.source);
              const toId = String(link.toNodeId || link.toNode || link.toId || link.target);
              const relText = safeString(link.relationship || link.relation || link.description, 'Causal Connection');

              const startPos = nodePositions[fromId];
              const endPos = nodePositions[toId];

              if (!startPos || !endPos) return null;

              const isStartAbove = startPos.y < endPos.y;

              const startX = startPos.x + 110;
              const startY = isStartAbove ? startPos.y + 175 : startPos.y - 6;

              const endX = endPos.x + 110;
              const endY = isStartAbove ? endPos.y - 6 : endPos.y + 175;

              const deltaY = Math.abs(endY - startY) * 0.45;
              const cp1Y = isStartAbove ? startY + deltaY : startY - deltaY;
              const cp2Y = isStartAbove ? endY - deltaY : endY + deltaY;

              const pathString = `M ${startX} ${startY} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${endY}`;
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              const isHovered = hoveredRelIndex === idx;

              return (
                <g key={idx}>
                  {/* Flexible Joint Arrow Path */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isHovered ? '#1D4ED8' : '#2563EB'}
                    strokeWidth={isHovered ? '4' : '2.5'}
                    strokeDasharray={isHovered ? 'none' : '6 4'}
                    markerEnd="url(#arrow-head-blue)"
                    style={{ transition: 'stroke-width 0.2s, stroke 0.2s' }}
                  />

                  {/* Interactive Relationship Text Badge & Hover Popover Card */}
                  <foreignObject
                    x={isHovered ? midX - 160 : midX - 110}
                    y={isHovered ? midY - 35 : midY - 14}
                    width={isHovered ? '320' : '220'}
                    height={isHovered ? '120' : '28'}
                    style={{ overflow: 'visible', pointerEvents: 'auto' }}
                    onMouseEnter={() => setHoveredRelIndex(idx)}
                    onMouseLeave={() => setHoveredRelIndex(null)}
                  >
                    <div
                      style={{
                        fontSize: isHovered ? '12px' : '10px',
                        fontFamily: 'sans-serif',
                        fontWeight: 700,
                        backgroundColor: '#FFFFFF',
                        color: isHovered ? '#1E4ED8' : '#2563EB',
                        border: isHovered ? '2px solid #2563EB' : '1px solid #93C5FD',
                        borderRadius: isHovered ? '8px' : '4px',
                        padding: isHovered ? '8px 12px' : '3px 8px',
                        textAlign: 'center',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: isHovered ? 'normal' : 'nowrap',
                        boxShadow: isHovered ? '0 10px 25px rgba(37,99,235,0.28)' : '0 2px 6px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        zIndex: isHovered ? 1000 : 10
                      }}
                    >
                      {isHovered ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Info size={11} color="#2563EB" />
                            <span>Causal Relationship</span>
                          </div>
                          <div style={{ color: '#0F172A', fontWeight: 600, lineHeight: 1.4 }}>
                            {relText}
                          </div>
                        </div>
                      ) : (
                        relText
                      )}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* Render Absolutely Positioned Movable Node Blocks */}
          {uniqueNodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 200, y: 200 };
            const isBeingDragged = draggedNodeId === node.id;

            return (
              <div
                key={node.id}
                className="individual-node-wrapper"
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: isBeingDragged ? 50 : 10,
                  cursor: isBeingDragged ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  transition: isBeingDragged ? 'none' : 'box-shadow 0.15s ease-out',
                  backgroundColor: '#FFFFFF',
                  border: isBeingDragged ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  borderRadius: '10px',
                  boxShadow: isBeingDragged ? '0 12px 28px rgba(37,99,235,0.25)' : '0 4px 12px rgba(0,0,0,0.05)',
                  width: '220px'
                }}
              >
                <div style={{ padding: '4px 8px', backgroundColor: isBeingDragged ? '#2563EB' : '#F1F5F9', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono-label" style={{ fontSize: '9px', fontWeight: 800, color: isBeingDragged ? '#FFFFFF' : '#475569' }}>
                    L{node.graphLevel} NODE BLOCK
                  </span>
                  <Grab size={10} color={isBeingDragged ? '#FFFFFF' : '#64748B'} />
                </div>
                <CompactTreeNode node={node} />
              </div>
            );
          })}

        </div>

        {/* FLOATING INTERACTIVE CANVAS ZOOM TOOLBAR */}
        <div className="zoom-toolbar" style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out (-)">
            <ZoomOut size={14} />
          </button>
          
          <span className="mono-label" style={{ fontSize: '11px', padding: '0 6px', fontWeight: 700, color: '#0F172A' }}>
            {Math.round(zoomScale * 100)}%
          </span>

          <button className="zoom-btn" onClick={zoomIn} title="Zoom In (+)">
            <ZoomIn size={14} />
          </button>

          <div style={{ width: '1px', height: '14px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

          <button className="zoom-btn" onClick={autoOrganizeLayout} title="Auto-Align 3-Tier Grid Layout">
            <LayoutGrid size={13} />
            <span>Align</span>
          </button>

          <button className="zoom-btn" onClick={() => { setZoomScale(0.85); setPanPos({ x: 0, y: 0 }); }} title="Reset (100%)">
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

      </div>

    </div>
  );
}
