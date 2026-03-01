import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AvatarHero = () => {
  const cardRef = useRef(null);
  const [entryDone, setEntryDone] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!entryDone || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;
    setTilt({
      rotateY: normalizedX * 12,
      rotateX: normalizedY * -12,
      glowX: x * 100,
      glowY: y * 100,
    });
  }, [entryDone]);

  const handleMouseEnter = useCallback(() => {
    if (entryDone) setHovering(true);
  }, [entryDone]);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  }, []);

  return (
    <AvatarWrapper>
      <AvatarCard
        ref={cardRef}
        as={motion.div}
        initial={{ opacity: 0, scaleY: 0.01 }}
        animate={{
          opacity: [0, 0.4, 0.1, 0.7, 0.2, 0.9, 0.5, 1],
          scaleY: [0.01, 0.6, 0.4, 0.8, 0.7, 1],
        }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        onAnimationComplete={() => setEntryDone(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={entryDone ? {
          transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: hovering ? 'transform 0.1s ease-out' : 'transform 0.4s ease',
        } : undefined}
      >
        <ProfileImage />
        <GlowOverlay
          style={{
            background: 'none',
          }}
        />
      </AvatarCard>
    </AvatarWrapper>
  );
};

const AvatarWrapper = styled.div`
  perspective: 800px;
  width: 300px;
  height: 300px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 280px;
    height: 280px;
  }

  @media (max-width: 480px) {
    width: 260px;
    height: 260px;
  }

  @media (prefers-reduced-motion: reduce) {
    perspective: none;
  }
`;

const AvatarCard = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: none;
  box-shadow: none;
  transform-style: preserve-3d;
  will-change: transform;
  cursor: default;

  @media (prefers-reduced-motion: reduce) {
    transform: none !important;
    transition: none !important;
  }
`;

const ProfileImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('${process.env.PUBLIC_URL}/profile.png');
  background-size: cover;
  background-position: center top;
`;

const GlowOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 6px;
  transition: background 0.15s ease-out;
`;

export default AvatarHero;
