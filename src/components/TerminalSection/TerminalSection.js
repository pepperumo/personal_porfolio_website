import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useScrollTyping from '../../hooks/useScrollTyping';

const flickerVariants = {
  hidden: { opacity: 0, x: 0 },
  visible: {
    opacity: [0, 0.7, 0.15, 0.9, 0.3, 1],
    x: [0, -2, 3, -1, 0],
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const TerminalSection = ({ title, subtitle, children }) => {
  const { displayed: headingDisplayed, done: headingDone, ref: headingRef } = useScrollTyping(title, { speed: 35 });
  const headingDuration = title ? title.length * 35 : 0;
  const { displayed: subtitleDisplayed, done: subtitleDone, ref: subtitleRef } = useScrollTyping(subtitle, {
    speed: 20,
    startDelay: headingDuration + 200
  });

  return (
    <SectionBox
      as={motion.div}
      variants={flickerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0 }}
    >
      <TerminalHeader>
        <TerminalDot $color="#ff5f57" />
        <TerminalDot $color="#febc2e" />
        <TerminalDot $color="#28c840" />
        <TerminalTitle>~/{title ? title.toLowerCase().replace(/\s+/g, '-') : 'terminal'}</TerminalTitle>
      </TerminalHeader>

      <TerminalBody>
        <HeadingWrapper ref={headingRef} className="section-heading">
          <Prefix>$ </Prefix>
          {headingDisplayed}
          <Cursor $hide={headingDone}>|</Cursor>
        </HeadingWrapper>

        {subtitle && (
          <SubtitleWrapper ref={subtitleRef} className="section-subtitle">
            {subtitleDisplayed}
            <Cursor $hide={subtitleDone}>|</Cursor>
          </SubtitleWrapper>
        )}

        {children}
      </TerminalBody>
    </SectionBox>
  );
};

const SectionBox = styled.div`
  background: var(--glass-bg);
  border: var(--glass-border);
  border-radius: var(--glass-radius);
  overflow: hidden;
`;

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 8px;
`;

const TerminalDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TerminalTitle = styled.span`
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  margin-left: 8px;
`;

const TerminalBody = styled.div`
  padding: 30px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const HeadingWrapper = styled.h2`
  /* Inherits global h2.section-heading styles via className */
`;

const SubtitleWrapper = styled.p`
  /* Inherits global p.section-subtitle styles via className */
`;

const Prefix = styled.span`
  opacity: 0.5;
  font-size: 0.5em;
`;

const Cursor = styled.span`
  display: ${({ $hide }) => ($hide ? 'none' : 'inline')};
  animation: ${blink} 0.7s step-end infinite;
  color: var(--secondary-color);
  font-weight: 300;
`;

export default TerminalSection;
