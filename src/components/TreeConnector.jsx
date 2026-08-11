import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Minimalist Notion-Style Tree Connectors
 */

export function TreeDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <marker id="arrow-notion" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill="var(--tree-connector-color, #D3D3D3)" />
        </marker>
      </defs>
    </svg>
  );
}

export function VerticalStem({ height = 24, isAnimating = false, hasArrow = true }) {
  const lineRef = useRef(null);

  useEffect(() => {
    if (lineRef.current) {
      const length = height + 10;
      if (isAnimating) {
        gsap.fromTo(
          lineRef.current,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }
        );
      } else {
        gsap.set(lineRef.current, { strokeDasharray: 'none', strokeDashoffset: 0 });
      }
    }
  }, [isAnimating, height]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: `${height}px` }}>
      <svg width="24" height={height} style={{ overflow: 'visible' }}>
        <line
          ref={lineRef}
          x1="12"
          y1="0"
          x2="12"
          y2={height - (hasArrow ? 6 : 0)}
          stroke="var(--tree-connector-color, #D3D3D3)"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd={hasArrow ? "url(#arrow-notion)" : "none"}
        />
      </svg>
    </div>
  );
}

export function BranchConnector({ childCount = 1, isAnimating = false }) {
  if (childCount <= 1) {
    return null; 
  }

  // The BranchConnector now ONLY draws the top vertical stem dropping from the parent down to the horizontal line.
  // The horizontal line is drawn by the child NodeBranches to ensure mathematically perfect alignment regardless of child width.
  return <VerticalStem height={16} isAnimating={isAnimating} hasArrow={false} />;
}
