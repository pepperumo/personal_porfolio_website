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
  return (
    <ChatButtonContainer 
      className={className}
      onClick={onClick}
      data-testid="prominent-chat-button"
      aria-label="Open chat with PeppeGPT"
    >
      <ButtonIcon>💬</ButtonIcon>
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
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
    transform: translateY(-3px);
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
  font-size: 16px;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    font-size: 18px;
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