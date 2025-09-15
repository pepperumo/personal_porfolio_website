import React, { useRef, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';

const ChatPanel = ({ onClose }) => {
  const {
    messages,
    currentMessage,
    updateCurrentMessage,
    sendMessage,
    isLoading,
    error,
    isConnected,
    clearError,
    getSuggestions,
    addMessage
  } = useChat();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Use useMemo to recalculate suggestions when messages change
  const suggestions = useMemo(() => getSuggestions(), [getSuggestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Focus input when panel opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    await sendMessage(currentMessage);
    updateCurrentMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSuggestionClick = (questionObj) => {
    // For suggestion objects with pre-answered responses, add both question and answer directly
    if (typeof questionObj === 'object' && questionObj.question && questionObj.answer) {
      // Add the user question
      addMessage({
        role: 'user',
        content: questionObj.question
      });
      
      // Add the pre-answered response with a slight delay for natural flow
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: questionObj.answer
        });
      }, 300);
    } else {
      // Fallback for old format
      const questionText = typeof questionObj === 'string' ? questionObj : questionObj.question;
      updateCurrentMessage(questionText);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleRetry = () => {
    clearError();
    if (currentMessage.trim()) {
      sendMessage(currentMessage);
    }
  };

  // Show welcome message if no messages yet
  const displayMessages = messages.length === 0 ? [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm PeppeGPT, your AI assistant. Ask me anything about Giuseppe's skills, experience, or projects!",
      timestamp: new Date().toISOString()
    }
  ] : messages;

  return (
    <PanelContainer role="dialog" aria-modal="true" aria-label="Chat with PeppeGPT">
      <PanelHeader>
        <HeaderTitle>
          <ProfileImage src={`${process.env.PUBLIC_URL}/profile.png`} alt="Giuseppe" />
          PeppeGPT
          {!isConnected && <OfflineIndicator title="Offline">⚠️</OfflineIndicator>}
        </HeaderTitle>
        <CloseButton onClick={onClose} aria-label="Close chat">
          ×
        </CloseButton>
      </PanelHeader>

      <MessagesContainer>
        {displayMessages.map((message) => (
          <MessageBubble key={message.id} role={message.role}>
            <MessageContent $isError={message.isError}>
              {message.content}
            </MessageContent>
            <MessageTime>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </MessageTime>
          </MessageBubble>
        ))}
        
        {isLoading && (
          <MessageBubble role="assistant">
            <TypingIndicator>
              <CircularSpinner />
            </TypingIndicator>
            <div style={{ fontSize: '0.8em', color: 'var(--tertiary-color)', marginTop: '8px', fontStyle: 'italic' }}>
              Processing your question... (typically 10-15 seconds)
            </div>
          </MessageBubble>
        )}
        
        {error && (
          <ErrorContainer>
            <ErrorMessage>{error.message}</ErrorMessage>
            {error.action === 'retry' && (
              <RetryButton onClick={handleRetry}>Try Again</RetryButton>
            )}
            {error.action === 'show_suggestions' && (
              <SuggestionsContainer>
                {suggestions.map((suggestion, index) => (
                  <SuggestionButton
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.question}
                  </SuggestionButton>
                ))}
              </SuggestionsContainer>
            )}
          </ErrorContainer>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {!error && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <SuggestionButton
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.question}
            </SuggestionButton>
          ))}
        </SuggestionsContainer>
      )}

      <InputContainer>
        <InputForm onSubmit={handleSendMessage}>
          <MessageInput
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => updateCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Ask about skills, experience, projects..." : "Currently offline..."}
            disabled={isLoading || !isConnected}
            aria-label="Type your message"
            maxLength={800}
          />
          <SendButton 
            type="submit" 
            disabled={!currentMessage.trim() || isLoading || !isConnected}
            title={!isConnected ? "Currently offline" : "Send message"}
          >
            <SendIcon>→</SendIcon>
          </SendButton>
        </InputForm>
        {currentMessage.length > 700 && (
          <CharacterCount $warning={currentMessage.length > 750}>
            {currentMessage.length}/800
          </CharacterCount>
        )}
      </InputContainer>
    </PanelContainer>
  );
};

// Styled components with enhanced error handling UI
const PanelContainer = styled.div`
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 420px;
  height: 550px;
  background: var(--background-light);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-primary);

  @media (max-width: 768px) {
    bottom: 80px;
    right: 16px;
    left: 16px;
    width: auto;
    height: 65vh;
    max-height: 600px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--background-dark);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  color: var(--text-primary);
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-color);
`;

const ProfileImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--secondary-color);
  box-shadow: 0 0 4px rgba(100, 255, 218, 0.3);
`;

const OfflineIndicator = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--transition);

  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
    color: var(--secondary-color);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--background-light);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--background-dark);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--tertiary-color);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
  }
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  gap: 4px;
`;

const MessageContent = styled.div`
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-${props => props.theme?.role === 'user' ? 'right' : 'left'}-radius: 4px;
  max-width: 80%;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
  font-size: 14px;
  
  ${MessageBubble}[role="user"] & {
    background: var(--secondary-color);
    color: var(--background-dark);
  }
  
  ${MessageBubble}[role="assistant"] & {
    background: ${props => props.$isError ? 'rgba(220, 53, 69, 0.1)' : 'var(--background-dark)'};
    color: ${props => props.$isError ? '#dc3545' : 'var(--text-secondary)'};
    border: ${props => props.$isError ? '1px solid rgba(220, 53, 69, 0.3)' : '1px solid rgba(100, 255, 218, 0.2)'};
  }
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: var(--tertiary-color);
  margin: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: var(--background-dark);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  min-width: 60px;
`;

const CircularSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(100, 255, 218, 0.2);
  border-top: 2px solid var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 8px;
`;

const RetryButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

const SuggestionsContainer = styled.div`
  padding: 8px 16px;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  background: var(--background-dark);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;



const SuggestionButton = styled.button`
  background: transparent;
  border: 1px solid var(--tertiary-color);
  border-radius: 10px;
  padding: 3px 6px;
  font-size: 10px;
  margin: 1px 0;
  cursor: pointer;
  color: var(--secondary-color);
  line-height: 1.2;
  transition: var(--transition);
  text-align: left;
  display: block;
  width: 100%;
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
    border-color: var(--secondary-color);
    color: var(--text-primary);
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(100, 255, 218, 0.2);
  background: var(--background-dark);
`;

const InputForm = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 1px solid var(--tertiary-color);
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: var(--font-primary);
  resize: none;
  min-height: 20px;
  max-height: 60px;
  line-height: 1.4;
  outline: none;
  background: var(--background-light);
  color: var(--text-primary);
  transition: var(--transition);

  &::placeholder {
    color: var(--tertiary-color);
  }

  &:focus {
    border-color: var(--secondary-color);
    box-shadow: 0 0 0 1px rgba(100, 255, 218, 0.2);
  }

  &:disabled {
    background: var(--background-dark);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SendButton = styled.button`
  background: ${props => props.disabled ? 'var(--tertiary-color)' : 'var(--secondary-color)'};
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: var(--transition);
  color: ${props => props.disabled ? 'rgba(10, 25, 47, 0.6)' : 'var(--background-dark)'};
  font-weight: bold;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: var(--secondary-light);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(100, 255, 218, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SendIcon = styled.span`
  font-size: 18px;
  font-weight: bold;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CharacterCount = styled.div`
  font-size: 11px;
  color: ${props => props.$warning ? '#dc3545' : 'var(--tertiary-color)'};
  text-align: right;
  margin-top: 4px;
`;

export default ChatPanel;