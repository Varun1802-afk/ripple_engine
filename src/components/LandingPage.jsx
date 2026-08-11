import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LoginFormModal } from './LoginFormModal';
import { MacNotesModal } from './MacNotesModal';
import { useGraph } from '../store/GraphContext';
import { Dock, DockIcon, DockItem, DockLabel } from './ui/dock';
import { LogOut, CheckCircle2 } from 'lucide-react';

// Real-Time Apple iOS Clock Icon Component
function RealTimeIOSClock({ refProp }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secDeg = seconds * 6;
  const minDeg = (minutes + seconds / 60) * 6;
  const hrDeg = ((hours % 12) + minutes / 60) * 30;

  return (
    <div
      ref={refProp}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#1C1C1E',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform, opacity'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.14) translateY(-6px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
      title={`Apple Live Clock - ${time.toLocaleTimeString()}`}
    >
      {/* Clock Face Circle */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Hour Tick Marks (12, 3, 6, 9) */}
        <div style={{ position: 'absolute', top: '3px', width: '2px', height: '4px', backgroundColor: '#FFFFFF', opacity: 0.8 }} />
        <div style={{ position: 'absolute', right: '3px', width: '4px', height: '2px', backgroundColor: '#FFFFFF', opacity: 0.8 }} />
        <div style={{ position: 'absolute', bottom: '3px', width: '2px', height: '4px', backgroundColor: '#FFFFFF', opacity: 0.8 }} />
        <div style={{ position: 'absolute', left: '3px', width: '4px', height: '2px', backgroundColor: '#FFFFFF', opacity: 0.8 }} />

        {/* Hour Hand */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: 'calc(50% - 1.5px)',
            width: '3px',
            height: '13px',
            backgroundColor: '#FFFFFF',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `rotate(${hrDeg}deg)`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}
        />

        {/* Minute Hand */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: 'calc(50% - 1px)',
            width: '2px',
            height: '18px',
            backgroundColor: '#FFFFFF',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `rotate(${minDeg}deg)`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}
        />

        {/* Second Hand (Orange/Red Apple Style) */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: 'calc(50% - 0.75px)',
            width: '1.5px',
            height: '21px',
            backgroundColor: '#FF3B30',
            borderRadius: '1px',
            transformOrigin: 'bottom center',
            transform: `rotate(${secDeg}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)'
          }}
        />

        {/* Center Pin */}
        <div
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#FF3B30',
            zIndex: 10
          }}
        />
      </div>
    </div>
  );
}

export function LandingPage() {
  const { user, logoutUser, setActiveView } = useGraph();
  // Login modal & Notes app modal open states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const handleAccountIconClick = () => {
    if (user) {
      // User is ALREADY logged in -> Immediately open Decision Input Panel!
      setActiveView('input');
    } else {
      // User is NOT logged in -> Open Login Modal!
      setIsLoginModalOpen(true);
    }
  };

  // Cursor tracking for cartoon googly eyes looking around & mouse parallax
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Draggable state positions for the 3 sticker tags
  const [tagOffsets, setTagOffsets] = useState({
    tag1: { x: 0, y: 0 },
    tag2: { x: 0, y: 0 },
    tag3: { x: 0, y: 0 }
  });
  const [draggingTag, setDraggingTag] = useState(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialX: 0, initialY: 0 });

  // Refs for GSAP animation choreography
  const skyRef = useRef(null);
  const mountainRef = useRef(null);
  const brandLogoRef = useRef(null);
  const headingRef = useRef(null);
  const sticker1Ref = useRef(null);
  const sticker2Ref = useRef(null);
  const sticker3Ref = useRef(null);
  const taglineRef = useRef(null);
  const eyesRef = useRef(null);
  const dockIcon1Ref = useRef(null);
  const dockIcon2Ref = useRef(null);
  const dockIcon3Ref = useRef(null);

  // Mouse move listener for parallax, googly eyes, and tag dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Handle tag dragging
      if (draggingTag) {
        const dx = e.clientX - dragStartRef.current.mouseX;
        const dy = e.clientY - dragStartRef.current.mouseY;
        setTagOffsets((prev) => ({
          ...prev,
          [draggingTag]: {
            x: dragStartRef.current.initialX + dx,
            y: dragStartRef.current.initialY + dy
          }
        }));
      }

      // Subtle mouse depth parallax effect on background layers
      const moveX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const moveY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      if (skyRef.current) {
        gsap.to(skyRef.current, {
          x: moveX * 8,
          y: moveY * 6,
          duration: 1.2,
          ease: 'power1.out'
        });
      }
      if (mountainRef.current) {
        gsap.to(mountainRef.current, {
          x: -moveX * 12,
          y: -moveY * 8,
          duration: 1.2,
          ease: 'power1.out'
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingTag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTag]);

  const handleStartDrag = (tagKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingTag(tagKey);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: tagOffsets[tagKey].x,
      initialY: tagOffsets[tagKey].y
    };
  };

  // GSAP Intro Entrance Choreography Sequence
  useEffect(() => {
    const sky = skyRef.current;
    const mountain = mountainRef.current;
    const brandLogo = brandLogoRef.current;
    const heading = headingRef.current;
    const stickers = [sticker1Ref.current, sticker2Ref.current, sticker3Ref.current].filter(Boolean);
    const tagline = taglineRef.current;
    const dockIcons = [dockIcon1Ref.current, dockIcon2Ref.current, dockIcon3Ref.current].filter(Boolean);

    // Initial state setup before animation starts
    gsap.set(sky, { yPercent: -100, opacity: 1 });
    gsap.set(mountain, { yPercent: 100, opacity: 1 });
    gsap.set(heading, { opacity: 0, y: -45 });
    gsap.set(stickers, { scale: 0, opacity: 0 });
    gsap.set(tagline, { opacity: 0, x: -70 });
    gsap.set(brandLogo, { opacity: 0, y: -25 });
    gsap.set(dockIcons, { scale: 0, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step 1: Sky slides down from top, Mountain slides up from bottom
    tl.to(sky, { yPercent: 0, duration: 1.2, ease: 'power2.inOut' }, 0.1)
      .to(mountain, { yPercent: 0, duration: 1.2, ease: 'power2.inOut' }, 0.1)

    // Step 2: Main Heading falls into place from top
      .to(heading, { opacity: 1, y: 0, duration: 0.85 }, '-=0.35')

    // Step 3: Sticker clips pop into frame with back spring bounce
      .to(stickers, {
        scale: 1,
        opacity: 1,
        duration: 0.65,
        stagger: 0.14,
        ease: 'back.out(1.8)'
      }, '-=0.3')

    // Step 4: Bottom-Left tagline slides in from left
      .to(tagline, { opacity: 1, x: 0, duration: 0.75 }, '-=0.3')

    // Step 5: Main Title "RIPPLE ENGINE" animates in from top after all above elements
      .to(brandLogo, { opacity: 1, y: 0, duration: 0.7 }, '-=0.25')

    // Step 6: 3 iPhone Icons pop out with sudden pop effect
      .to(dockIcons, {
        scale: 1,
        opacity: 1,
        duration: 0.65,
        stagger: 0.16,
        ease: 'back.out(2.2)'
      }, '-=0.3');

  }, []);

  // Calculate inner pupil offset based on mouse position relative to eyes
  const calculatePupilOffset = () => {
    if (!eyesRef.current) return { x: 0, y: 0 };
    const rect = eyesRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 10;

    if (dist === 0) return { x: 0, y: 0 };
    const clampedDist = Math.min(dist, maxRadius);
    return {
      x: (dx / dist) * clampedDist,
      y: (dy / dist) * clampedDist
    };
  };

  // Calculate whole eye unit movement tracking the mouse
  const calculateWholeEyeOffset = () => {
    if (!eyesRef.current) return { x: 0, y: 0 };
    const rect = eyesRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxEyeShift = 24;

    if (dist === 0) return { x: 0, y: 0 };
    const clampedDist = Math.min(dist, maxEyeShift);
    return {
      x: (dx / dist) * clampedDist,
      y: (dy / dist) * clampedDist
    };
  };

  const pupilOffset = calculatePupilOffset();
  const eyeUnitOffset = calculateWholeEyeOffset();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#60A5FA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 40px 32px 40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
      }}
    >
      {/* Background Parallax Layer 1: Sky and Clouds */}
      <img
        ref={skyRef}
        src="/sky.png"
        alt="Sky Layer"
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-4%',
          width: '108%',
          height: '108%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 1,
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'scale(1.08)',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />

      {/* Background Parallax Layer 2: Mountain and Hills */}
      <img
        ref={mountainRef}
        src="/mountain.png"
        alt="Mountain Layer"
        style={{
          position: 'absolute',
          top: '-4%',
          left: '-4%',
          width: '108%',
          height: '108%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
          zIndex: 2,
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'scale(1.08)',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />

      {/* Top Header Section */}
      <header
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 50
        }}
      >
        {/* Main Brand Title: RIPPLE ENGINE */}
        <div
          ref={brandLogoRef}
          style={{
            fontFamily: '"Syne", "Outfit", sans-serif',
            fontWeight: 800,
            fontSize: '26px',
            letterSpacing: '0.18em',
            color: '#FFFFFF',
            textShadow: '0 2px 12px rgba(0,0,0,0.35)'
          }}
        >
          RIPPLE ENGINE®
        </div>
      </header>

      {/* Center Hero Section */}
      <main
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          margin: 'auto 0',
          zIndex: 20,
          maxWidth: '850px',
          width: '100%'
        }}
      >
        {/* Main Left-Aligned Hero Heading */}
        <h3
          ref={headingRef}
          style={{
            fontFamily: '"Syne", "Outfit", "Plus Jakarta Sans", sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(28px, 3.6vw, 56px)',
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            textAlign: 'left',
            margin: 0,
            padding: 0,
            textShadow: '0 6px 24px rgba(0,0,0,0.35)',
            textTransform: 'uppercase',
            position: 'relative',
            willChange: 'transform, opacity'
          }}
        >
          DECISION<br />
          THAT RIPPLES<br />
          ACROSS<br />
          EVERY HORIZON
        </h3>

        {/* Movable Floating Sticker Tag 1 (Strategic AI) */}
        <div
          ref={sticker1Ref}
          onMouseDown={(e) => handleStartDrag('tag1', e)}
          style={{
            position: 'absolute',
            top: '25px',
            left: '-70px',
            transform: `translate(${tagOffsets.tag1.x}px, ${tagOffsets.tag1.y}px) rotate(-10deg)`,
            display: 'flex',
            alignItems: 'center',
            zIndex: draggingTag === 'tag1' ? 100 : 35,
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))',
            cursor: draggingTag === 'tag1' ? 'grabbing' : 'grab',
            userSelect: 'none',
            willChange: 'transform, opacity'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#84CC16',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '19px',
              boxShadow: '0 4px 14px rgba(132, 204, 22, 0.45)',
              marginRight: '-12px',
              zIndex: 2
            }}
          >
            📎
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              padding: '8px 18px 8px 16px',
              fontSize: '16px',
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.02em',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            Strategic AI
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '9px',
                height: '9px',
                backgroundColor: '#84CC16',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>

        {/* Movable Floating Sticker Tag 2 (Ripple Graph) */}
        <div
          ref={sticker2Ref}
          onMouseDown={(e) => handleStartDrag('tag2', e)}
          style={{
            position: 'absolute',
            top: '-16px',
            left: '265px',
            transform: `translate(${tagOffsets.tag2.x}px, ${tagOffsets.tag2.y}px) rotate(8deg)`,
            display: 'flex',
            alignItems: 'center',
            zIndex: draggingTag === 'tag2' ? 100 : 35,
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))',
            cursor: draggingTag === 'tag2' ? 'grabbing' : 'grab',
            userSelect: 'none',
            willChange: 'transform, opacity'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#EC4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '19px',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.45)',
              marginRight: '-12px',
              zIndex: 2
            }}
          >
            ✏️
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              padding: '8px 18px 8px 16px',
              fontSize: '16px',
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.02em',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            Ripple Graph
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '9px',
                height: '9px',
                backgroundColor: '#EC4899',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>

        {/* Movable Floating Sticker Tag 3 (Scenario Engine) */}
        <div
          ref={sticker3Ref}
          onMouseDown={(e) => handleStartDrag('tag3', e)}
          style={{
            position: 'absolute',
            top: '72px',
            left: '225px',
            transform: `translate(${tagOffsets.tag3.x}px, ${tagOffsets.tag3.y}px) rotate(-6deg)`,
            display: 'flex',
            alignItems: 'center',
            zIndex: draggingTag === 'tag3' ? 100 : 35,
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))',
            cursor: draggingTag === 'tag3' ? 'grabbing' : 'grab',
            userSelect: 'none',
            willChange: 'transform, opacity'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '19px',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.45)',
              marginRight: '-12px',
              zIndex: 2
            }}
          >
            🧊
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              padding: '8px 18px 8px 16px',
              fontSize: '16px',
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.02em',
              position: 'relative',
              whiteSpace: 'nowrap'
            }}
          >
            Scenario Engine
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '9px',
                height: '9px',
                backgroundColor: '#8B5CF6',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <footer
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 50
        }}
      >
        {/* Bottom-Left Tagline */}
        <div
          ref={taglineRef}
          style={{
            color: '#FFFFFF',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            willChange: 'transform, opacity'
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              opacity: 0.95,
              letterSpacing: '-0.01em'
            }}
          >
            — High Consequence Policy Analysis.
          </span>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em'
            }}
          >
            simulate strategic decisions<br />
            <span style={{ fontStyle: 'italic', fontWeight: 700 }}>see ripples live</span>
          </div>
        </div>

        {/* Bottom-Center Interactive Cartoon Eyes + iPhone Icons Glass Dock */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Peering Cartoon Googly Eyes (👀) - Dynamic Cursor Tracking */}
          <div
            ref={eyesRef}
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '-8px',
              zIndex: 60,
              transform: `translate(${eyeUnitOffset.x}px, ${eyeUnitOffset.y}px)`,
              transition: 'transform 0.08s ease-out'
            }}
          >
            {/* Left Eye */}
            <div
              style={{
                width: '32px',
                height: '38px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '16px',
                  backgroundColor: '#0F172A',
                  borderRadius: '50%',
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: 'transform 0.04s ease-out'
                }}
              />
            </div>

            {/* Right Eye */}
            <div
              style={{
                width: '32px',
                height: '38px',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '16px',
                  backgroundColor: '#0F172A',
                  borderRadius: '50%',
                  transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
                  transition: 'transform 0.04s ease-out'
                }}
              />
            </div>
          </div>

          {/* Frosted Glass Dock Container */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '30px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)'
            }}
          >
            {/* 1st iPhone Icon: iOS Notes App */}
            <div
              ref={dockIcon1Ref}
              onClick={() => setIsNotesModalOpen(true)}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                willChange: 'transform, opacity'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.14) translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
              title="Click to open Notes.app (Saved Decision Sessions)"
            >
              {/* Yellow Header */}
              <div style={{ height: '22px', backgroundColor: '#FACC15', width: '100%' }} />
              {/* Ruled Lines */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  padding: '4px 8px'
                }}
              >
                <div style={{ height: '2px', backgroundColor: '#E2E8F0', width: '85%' }} />
                <div style={{ height: '2px', backgroundColor: '#E2E8F0', width: '100%' }} />
                <div style={{ height: '2px', backgroundColor: '#E2E8F0', width: '65%' }} />
              </div>
            </div>

            {/* 2nd iPhone Icon: iOS Real-Time Live Clock App */}
            <RealTimeIOSClock refProp={dockIcon2Ref} />

            {/* 3rd iPhone Icon: iOS User / Account Profile App */}
            <div
              ref={dockIcon3Ref}
              onClick={handleAccountIconClick}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: user 
                  ? 'linear-gradient(180deg, #059669 0%, #10B981 100%)' 
                  : 'linear-gradient(180deg, #4F46E5 0%, #3B82F6 100%)',
                boxShadow: user 
                  ? '0 8px 20px rgba(16, 185, 129, 0.4)' 
                  : '0 8px 20px rgba(79, 70, 229, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
                willChange: 'transform, opacity'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.14) translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
              title={user ? `Logged in as ${user.displayName || user.email} (Click to open Decision Panel)` : "User Login / Account Profile"}
            >
              {/* iOS User Profile Silhouette Icon */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  position: 'relative'
                }}
              >
                {/* Head Circle */}
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}
                />
                {/* Shoulders Arc */}
                <div
                  style={{
                    width: '28px',
                    height: '14px',
                    borderRadius: '14px 14px 0 0',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}
                />
              </div>

              {/* Active Online Indicator Badge when Logged In */}
              {user && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#34D399',
                    border: '2px solid #FFFFFF',
                    borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                  title="Authenticated & Logged In"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom-Right Spacer */}
        <div style={{ width: '220px' }} />
      </footer>

      {/* Firebase Authentication Login Form Modal */}
      <LoginFormModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* macOS Notes App Modal (Saved Decision Sessions) */}
      <MacNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}
