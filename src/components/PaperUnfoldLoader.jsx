import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Scroll, Sparkles } from 'lucide-react';

export function PaperUnfoldLoader({ onComplete }) {
  const overlayRef = useRef(null);
  const sheetRef = useRef(null);
  const textRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    });

    // 1. Initial State: Rolled-up crumpled paper ball/sheet
    gsap.set(sheetRef.current, {
      scale: 0.12,
      rotation: 24,
      borderRadius: '40px',
      opacity: 0.6
    });

    gsap.set(textRef.current, {
      opacity: 0,
      y: 10
    });

    // 2. Unfold & Flatten Sequence
    tl.to(sheetRef.current, {
      scale: 1,
      rotation: 0,
      borderRadius: '0px',
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out'
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out'
    }, '-=0.25')
    .to(textRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      delay: 0.4
    })
    .to(sheetRef.current, {
      opacity: 0.95,
      boxShadow: 'none',
      duration: 0.2
    })
    .to(overlayRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    });

  }, [onComplete]);

  if (isFinished) return null;

  return (
    <div ref={overlayRef} className="paper-unfold-overlay">
      <div ref={sheetRef} className="paper-sheet-unfold">
        <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'var(--surface-selected)', border: '1px solid var(--border-strong)' }}>
            <Scroll size={28} color="var(--text-primary)" />
          </div>

          <div className="mono-label" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} />
            <span>UNFOLDING DECISION CANVAS...</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, margin: 0, textAlign: 'center' }}>
            Decision-Analysis System
          </h2>
        </div>
      </div>
    </div>
  );
}
