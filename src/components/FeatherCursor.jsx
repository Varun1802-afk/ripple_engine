import React, { useEffect, useRef, useState } from 'react';
import { useGraph } from '../store/GraphContext.jsx';
import { gsap } from 'gsap';

export function FeatherCursor() {
  const { theme } = useGraph();
  const cursorRef = useRef(null);
  const featherRef = useRef(null);
  const [inkDrops, setInkDrops] = useState([]);

  const posRef = useRef({ x: -100, y: -100 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const lastPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let animId;
    let time = 0;

    // Apply cursor: none to body while Feather Cursor is active
    document.body.style.cursor = 'none';

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      velRef.current = {
        vx: x - lastPosRef.current.x,
        vy: y - lastPosRef.current.y
      };

      posRef.current = { x, y };
      lastPosRef.current = { x, y };

      // Spawn subtle ink droplets behind feather tip periodically on move
      const speed = Math.hypot(velRef.current.vx, velRef.current.vy);
      if (speed > 4 && Math.random() < 0.45) {
        const id = Date.now() + Math.random();
        setInkDrops((prev) => [
          ...prev.slice(-16),
          { id, x: x - 4, y: y + 24, size: Math.random() * 5 + 2 }
        ]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Smooth physics loop for swaying feather quill
    const updateCursor = () => {
      time += 0.05;
      const { x, y } = posRef.current;
      const { vx } = velRef.current;

      // Calculate swaying tilt angle based on velocity + gentle sine wave
      const tilt = Math.max(-35, Math.min(35, vx * 1.8)) + Math.sin(time * 3) * 6;

      if (cursorRef.current) {
        gsap.set(cursorRef.current, { x, y });
      }

      if (featherRef.current) {
        gsap.set(featherRef.current, { rotation: tilt });
      }

      // Decelerate velocity smoothly
      velRef.current.vx *= 0.85;
      velRef.current.vy *= 0.85;

      animId = requestAnimationFrame(updateCursor);
    };

    animId = requestAnimationFrame(updateCursor);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Clean old ink droplets after fade out
  useEffect(() => {
    if (inkDrops.length === 0) return;
    const timer = setTimeout(() => {
      setInkDrops((prev) => prev.filter((d) => Date.now() - d.id < 1200));
    }, 400);
    return () => clearTimeout(timer);
  }, [inkDrops]);

  return (
    <>
      {/* Floating Feather Quill Cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-100px, -100px)',
          willChange: 'transform'
        }}
      >
        <div
          ref={featherRef}
          style={{
            width: '36px',
            height: '36px',
            transformOrigin: 'top left',
            filter: 'drop-shadow(2px 4px 6px rgba(44, 29, 17, 0.4))'
          }}
        >
          {/* Feather Quill SVG */}
          <svg viewBox="0 0 64 64" width="36" height="36" fill="none">
            {/* Quill Stem */}
            <path
              d="M12 52 C 24 38, 42 22, 54 10"
              stroke="#2C1D11"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Feather Vane Left */}
            <path
              d="M16 48 C 10 38, 18 24, 38 14 C 44 11, 52 9, 54 10 C 52 16, 44 26, 32 36 Z"
              fill="#5C4229"
              stroke="#2C1D11"
              strokeWidth="1.2"
              opacity="0.9"
            />
            {/* Feather Vane Right */}
            <path
              d="M18 50 C 24 48, 38 42, 46 28 C 48 24, 52 14, 54 10 C 48 18, 36 32, 24 44 Z"
              fill="#8C6D4F"
              stroke="#2C1D11"
              strokeWidth="1"
              opacity="0.8"
            />
            {/* Ink Tip */}
            <circle cx="12" cy="52" r="2.5" fill="#1A0F08" />
          </svg>
        </div>
      </div>

      {/* Trailing Sepia Ink Droplets */}
      {inkDrops.map((drop) => (
        <div
          key={drop.id}
          style={{
            position: 'fixed',
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            backgroundColor: '#2A180B',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            opacity: 0.6,
            animation: 'inkDropFade 1s ease-out forwards'
          }}
        />
      ))}
    </>
  );
}
