import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSyncAlt } from 'react-icons/fa';

const PEPPEGPT_URL = 'https://peppegpt.giusepperumore.com/';

const MOTION_PROPS = new Set(['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView']);
const motionConfig = {
  shouldForwardProp: (prop) => !MOTION_PROPS.has(prop),
};

const PeppeGPTSidebar = ({ isOpen, onClose, onOpen }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const handleToggle = useCallback(() => {
    if (isOpen) onClose();
    else onOpen();
  }, [isOpen, onClose, onOpen]);

  const handleNewChat = useCallback(() => {
    setIframeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Avatar mascot with button — visible when chat is closed */}
      <AnimatePresence>
        {!isOpen && (
          <MascotContainer
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 2 }}
            onClick={handleToggle}
          >
            <MascotVideo autoPlay loop muted playsInline>
              <source src={`${process.env.PUBLIC_URL}/avatar_mascot.webm?v=5`} type="video/webm" />
            </MascotVideo>
          </MascotContainer>
        )}
      </AnimatePresence>

      {/* Close button — only visible when chat is open */}
      <AnimatePresence>
        {isOpen && (
          <FloatingChatButton
            onClick={handleToggle}
            aria-label="Close PeppeGPT"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <FaTimes size={22} />
          </FloatingChatButton>
        )}
      </AnimatePresence>

      {/* Refresh / new chat button — next to floating button */}
      <AnimatePresence>
        {isOpen && (
          <NewChatButton
            onClick={handleNewChat}
            aria-label="New chat"
            title="New chat"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <FaSyncAlt size={12} />
          </NewChatButton>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <ChatIframe
              key={iframeKey}
              src={PEPPEGPT_URL}
              title="PeppeGPT AI Assistant"
              allow="clipboard-write"
            />
          </ChatWindow>
        )}
      </AnimatePresence>
    </>
  );
};

const FloatingChatButton = styled(motion.button).withConfig(motionConfig)`
  all: unset;
  box-sizing: border-box;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1003;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--secondary-color, #00e8a2);
  background: rgba(10, 10, 26, 0.9);
  border: 1px solid rgba(0, 232, 162, 0.3);
  transition: all 0.2s ease;

  &::before, &::after {
    display: none;
  }

  &:hover {
    background: rgba(0, 232, 162, 0.15);
    box-shadow: 0 0 16px rgba(0, 232, 162, 0.3);
  }
`;

const ChatWindow = styled(motion.div).withConfig(motionConfig)`
  position: fixed;
  top: 80px;
  bottom: 86px;
  right: 20px;
  z-index: 1002;
  width: 500px;
  display: flex;
  flex-direction: column;
  background: var(--glass-bg, rgba(10, 10, 26, 0.95));
  border: 1px solid rgba(0, 232, 162, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @media (max-width: 480px) {
    top: 10px;
    bottom: 86px;
    right: 10px;
    left: 10px;
    width: auto;
    height: auto;
  }
`;

const NewChatButton = styled(motion.button).withConfig(motionConfig)`
  all: unset;
  box-sizing: border-box;
  position: fixed;
  bottom: 32px;
  right: 86px;
  z-index: 1003;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(10, 10, 26, 0.9);
  border: 1px solid rgba(0, 232, 162, 0.3);
  color: var(--secondary-color, #00e8a2);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 232, 162, 0.15);
    box-shadow: 0 0 10px rgba(0, 232, 162, 0.2);
  }

  &::before, &::after {
    display: none;
  }
`;


const MascotContainer = styled(motion.div).withConfig(motionConfig)`
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1003;
  width: 140px;
  height: 175px;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto;

  @media (max-width: 480px) {
    width: 110px;
    height: 140px;
    bottom: 8px;
    right: 8px;
  }
`;

const MascotVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: inset(8% 0 5% 0);
`;

const ChatIframe = styled.iframe`
  width: 100%;
  flex: 1;
  border: none;
  border-radius: 16px;
  min-height: 0;
`;

export default PeppeGPTSidebar;
