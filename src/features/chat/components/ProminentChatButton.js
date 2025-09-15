import React from 'react';
import styled from 'styled-components';

/**
 * Prominent chat button that matches the CV download button style
 * for better visibility and integration with the Home component.
 * 
 * @param {Function} onClick - Callback function when button is clicked
 * @param {string} className - Optional className for styling
 */
const ProminentChatButton = ({ onClick, className }) => {
  const ChatIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2C6.48 2 2 6.48 2 12C2 13.8 2.5 15.5 3.4 16.9L2 22L7.1 20.6C8.5 21.5 10.2 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.4 20 8.9 19.6 7.6 18.8L7.2 18.6L4.8 19.2L5.4 16.8L5.2 16.4C4.4 15.1 4 13.6 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" 
        fill="currentColor"
      />
      <circle cx="8.5" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="15.5" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );

  return (
    <ChatButtonContainer 
      className={className}
      onClick={onClick}
      data-testid="prominent-chat-button"
      aria-label="Open chat with PeppeGPT"
    >
      <ButtonIcon><ChatIcon /></ButtonIcon>
      <ButtonText>PeppeGPT</ButtonText>
    </ChatButtonContainer>
  );
};

const ChatButtonContainer = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-family: var(--font-mono);
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 500;
  
  /* Add subtle glow effect */
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 10px rgba(100, 255, 218, 0.2),
    0 0 20px rgba(100, 255, 218, 0.1);
  
  /* Subtle pulsing animation */
  animation: button-pulse 3s ease-in-out infinite;

  @keyframes button-pulse {
    0% {
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.2),
        0 0 10px rgba(100, 255, 218, 0.2),
        0 0 20px rgba(100, 255, 218, 0.1);
    }
    50% {
      box-shadow: 
        0 2px 12px rgba(0, 0, 0, 0.3),
        0 0 15px rgba(100, 255, 218, 0.4),
        0 0 30px rgba(100, 255, 218, 0.2);
    }
    100% {
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.2),
        0 0 10px rgba(100, 255, 218, 0.2),
        0 0 20px rgba(100, 255, 218, 0.1);
    }
  }

  svg {
    transition: var(--transition);
    filter: drop-shadow(0 0 1px rgba(100, 255, 218, 0.3));
  }
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
    transform: translateY(-3px);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(100, 255, 218, 0.6),
      0 0 40px rgba(100, 255, 218, 0.3);
    animation: none; /* Stop pulsing on hover */
    
    svg {
      filter: drop-shadow(0 0 2px rgba(100, 255, 218, 0.5));
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const ButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const ButtonText = styled.span`
  font-weight: 500;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export default ProminentChatButton;