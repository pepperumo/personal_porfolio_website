import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';

const ChatLauncher = () => {
  const { isChatOpen, toggleChat } = useChat();

  const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2C6.48 2 2 6.48 2 12C2 13.8 2.5 15.5 3.4 16.9L2 22L7.1 20.6C8.5 21.5 10.2 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.4 20 8.9 19.6 7.6 18.8L7.2 18.6L4.8 19.2L5.4 16.8L5.2 16.4C4.4 15.1 4 13.6 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" 
        fill="currentColor"
      />
      <circle cx="8.5" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M18 6L6 18M6 6L18 18" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <LauncherButton
      onClick={toggleChat}
      aria-label="Open chat with PeppeGPT"
      title="Ask me anything about my experience!"
      $isOpen={isChatOpen}
    >
      {isChatOpen ? <CloseIcon /> : <ChatIcon />}
    </LauncherButton>
  );
};

const LauncherButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid var(--secondary-color);
  background: var(--secondary-color);
  color: var(--background-dark);
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(100, 255, 218, 0.4),
    0 0 40px rgba(100, 255, 218, 0.2);
  transition: var(--transition);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  /* Pulsing glow animation */
  animation: ${props => props.$isOpen ? 'none' : 'pulse-glow 2s ease-in-out infinite'};

  @keyframes pulse-glow {
    0% {
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(100, 255, 218, 0.4),
        0 0 40px rgba(100, 255, 218, 0.2);
      transform: scale(1);
    }
    50% {
      box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.5),
        0 0 30px rgba(100, 255, 218, 0.8),
        0 0 60px rgba(100, 255, 218, 0.4),
        0 0 80px rgba(100, 255, 218, 0.2);
      transform: scale(1.05);
    }
    100% {
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(100, 255, 218, 0.4),
        0 0 40px rgba(100, 255, 218, 0.2);
      transform: scale(1);
    }
  }

  svg {
    transition: var(--transition);
    filter: drop-shadow(0 0 2px rgba(100, 255, 218, 0.3));
  }

  /* Hover state - enhanced appearance */
  &:hover {
    outline: none;
    transform: scale(1.1);
    box-shadow: 
      0 6px 24px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(100, 255, 218, 0.8),
      0 0 60px rgba(100, 255, 218, 0.5);
    background: var(--secondary-light);
    animation: none; /* Stop pulsing on hover */
    
    svg {
      transform: scale(1.1);
      filter: drop-shadow(0 0 4px rgba(100, 255, 218, 0.6));
    }
  }

  /* Focus state - same as normal state but without outline */
  &:focus,
  &:focus-visible {
    outline: none;
    /* Keep normal appearance when focused */
    background: var(--secondary-color);
    color: var(--background-dark);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(100, 255, 218, 0.4),
      0 0 40px rgba(100, 255, 218, 0.2);
    /* Resume pulsing when focused but not hovered */
    animation: ${props => props.$isOpen ? 'none' : 'pulse-glow 2s ease-in-out infinite'};
  }

  /* Hover takes precedence over focus */
  &:focus:hover {
    transform: scale(1.1);
    box-shadow: 
      0 6px 24px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(100, 255, 218, 0.8),
      0 0 60px rgba(100, 255, 218, 0.5);
    background: var(--secondary-light);
    animation: none;
    
    svg {
      transform: scale(1.1);
      filter: drop-shadow(0 0 4px rgba(100, 255, 218, 0.6));
    }
  }

  &:active {
    transform: scale(0.95);
    
    svg {
      transform: scale(0.9);
    }
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export default ChatLauncher;