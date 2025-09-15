import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';

const ChatLauncher = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <LauncherButton
      onClick={toggleChat}
      aria-label="Open chat with PeppeGPT"
      title="Ask me anything about my experience!"
      $isOpen={isChatOpen}
    >
      {isChatOpen ? '✕' : '💬'}
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
  border: none;
  background: ${props => props.$isOpen 
    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  font-size: ${props => props.$isOpen ? '18px' : '24px'};
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    font-size: ${props => props.$isOpen ? '16px' : '20px'};
  }
`;

export default ChatLauncher;