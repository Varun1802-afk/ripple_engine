import React, { useState, useRef, useEffect } from 'react';

// SVG Pin / Clip Accessories
function MetalBinderClip() {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        pointerEvents: 'none'
      }}
    >
      <path d="M7 6 C7 1, 21 1, 21 6 V16 H7 Z" stroke="#8E8E93" strokeWidth="2" fill="none" />
      <rect x="2" y="14" width="24" height="14" rx="2" fill="#1C1C1E" stroke="#000" strokeWidth="1.5" />
      <line x1="6" y1="21" x2="22" y2="21" stroke="#3A3A3C" strokeWidth="1.5" />
    </svg>
  );
}

function PushPin({ color = '#FF3B30' }) {
  return (
    <svg
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: '-12px',
        left: '20px',
        zIndex: 10,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
        pointerEvents: 'none'
      }}
    >
      <path d="M12 18 L12 26" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="11" r="8" fill={color} stroke="#000000" strokeWidth="1" />
      <circle cx="9.5" cy="8.5" r="2.5" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

function PaperClip() {
  return (
    <svg
      width="22"
      height="34"
      viewBox="0 0 22 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: '-12px',
        left: '16px',
        zIndex: 10,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
        pointerEvents: 'none'
      }}
    >
      <path
        d="M6 8 V24 C6 27, 16 27, 16 24 V6 C16 2, 9 2, 9 6 V20 C9 22, 13 22, 13 20 V9"
        stroke="#8E8E93"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function StickyNoteSticker({
  text,
  bgColor,
  rotation = '0deg',
  accessory = 'clip',
  accessoryColor,
  initialPos = { x: 0, y: 0 }
}) {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, z: 0 });

  const isDraggingRef = useRef(false);
  const posRef = useRef(initialPos);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  const baseAngle = parseFloat(rotation) || 0;

  // Sync posRef
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    isDraggingRef.current = true;
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y
    };
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    const onPointerMove = (moveEvt) => {
      if (!isDraggingRef.current) return;

      const newX = moveEvt.clientX - dragStartRef.current.x;
      const newY = moveEvt.clientY - dragStartRef.current.y;
      setPos({ x: newX, y: newY });

      // Calculate motion velocity vector for 3D Peel Tilt
      const vx = moveEvt.clientX - prevMouseRef.current.x;
      const vy = moveEvt.clientY - prevMouseRef.current.y;
      velocityRef.current = { x: vx, y: vy };
      prevMouseRef.current = { x: moveEvt.clientX, y: moveEvt.clientY };

      // Originkit 3D Inertia Tilt
      const tiltX = Math.max(-25, Math.min(25, -vy * 1.5));
      const tiltY = Math.max(-25, Math.min(25, vx * 1.5));
      const tiltZ = Math.max(-15, Math.min(15, vx * 0.6));

      setTilt({ x: tiltX, y: tiltY, z: tiltZ });
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      setTilt({ x: 0, y: 0, z: 0 });
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const currentRotationZ = baseAngle + tilt.z;

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`sticky-note-sticker ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: '165px',
        minHeight: '150px',
        backgroundColor: bgColor,
        padding: '24px 16px 18px 16px',
        borderRadius: isDragging ? '4px 8px 24px 8px' : '2px 4px 18px 3px',
        boxShadow: isDragging
          ? `${-velocityRef.current.x * 0.4 + 18}px ${-velocityRef.current.y * 0.4 + 28}px 48px rgba(0, 0, 0, 0.32), inset 0 -6px 14px rgba(0, 0, 0, 0.08)`
          : '6px 12px 24px rgba(0, 0, 0, 0.16), inset 0 -4px 8px rgba(0, 0, 0, 0.04)',
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        transform: isDragging
          ? `perspective(800px) translate3d(0, 0, 40px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${currentRotationZ}deg) scale(1.08)`
          : `perspective(800px) translate3d(0, 0, 0px) rotateX(0deg) rotateY(0deg) rotateZ(${baseAngle}deg) scale(1)`,
        transition: isDragging
          ? 'box-shadow 0.08s ease, border-radius 0.15s ease'
          : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-radius 0.4s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 100 : 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* Accessory Pins/Clips */}
      {accessory === 'binder' && <MetalBinderClip />}
      {accessory === 'pin' && <PushPin color={accessoryColor || '#FF3B30'} />}
      {accessory === 'paperclip' && <PaperClip />}

      {/* 3D Curved Peeled Corner Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '28px',
          height: '28px',
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.18) 50%)',
          borderBottomRightRadius: '18px',
          pointerEvents: 'none',
          opacity: isDragging ? 0.9 : 0.6,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* Handwritten Note Content */}
      <p
        style={{
          fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          color: '#2C2C2C',
          lineHeight: 1.4,
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '0.01em',
          textShadow: isDragging ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        {text}
      </p>
    </div>
  );
}

export function StickyNotesGroup() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        {/* Sticky Note 1: Top Left - Dusty Pink with Metal Binder Clip */}
        <StickyNoteSticker
          text="Good! Redesign the button"
          bgColor="#EAA0A7"
          rotation="-7deg"
          accessory="binder"
          initialPos={{ x: -140, y: -20 }}
        />

        {/* Sticky Note 2: Bottom Left - Coral Orange with Red Pushpin */}
        <StickyNoteSticker
          text="This needs to be done ASAP"
          bgColor="#FF9E79"
          rotation="-12deg"
          accessory="pin"
          accessoryColor="#FF3B30"
          initialPos={{ x: -150, y: 280 }}
        />

        {/* Sticky Note 3: Top Right - Sunny Yellow with Green Pushpin */}
        <StickyNoteSticker
          text="Keep track of critical details"
          bgColor="#FFE48E"
          rotation="8deg"
          accessory="pin"
          accessoryColor="#34C759"
          initialPos={{ x: 700, y: -15 }}
        />

        {/* Sticky Note 4: Bottom Right - Periwinkle Blue with Paperclip */}
        <StickyNoteSticker
          text="Pay attention to details"
          bgColor="#9BB0FF"
          rotation="10deg"
          accessory="paperclip"
          initialPos={{ x: 700, y: 285 }}
        />
      </div>
    </div>
  );
}
