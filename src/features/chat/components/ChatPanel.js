import React, { useRef, useEffect, useState } from 'react';
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
    getSuggestions
  } = useChat();
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [suggestions] = useState(getSuggestions());

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

  const handleSuggestionClick = (question) => {
    updateCurrentMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
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
          <ChatIcon>🤖</ChatIcon>
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
              {message.sources && message.sources.length > 0 && (
                <SourcesContainer>
                  <SourcesLabel>Sources:</SourcesLabel>
                  {message.sources.map((source, index) => (
                    <SourceBadge key={index} type={source.type}>
                      {source.title}
                    </SourceBadge>
                  ))}
                </SourcesContainer>
              )}
            </MessageContent>
            <MessageTime>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
              {message.confidence && (
                <ConfidenceScore>{Math.round(message.confidence * 100)}%</ConfidenceScore>
              )}
            </MessageTime>
          </MessageBubble>
        ))}
        
        {isLoading && (
          <MessageBubble role="assistant">
            <TypingIndicator>
              <TypingDot delay="0s" />
              <TypingDot delay="0.2s" />
              <TypingDot delay="0.4s" />
            </TypingIndicator>
            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
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
            {error.action === 'show_suggestions' && messages.length <= 1 && (
              <SuggestionsContainer>
                <SuggestionsTitle>Try asking about:</SuggestionsTitle>
                {suggestions.slice(0, 2).map((category) => (
                  <CategoryContainer key={category.category}>
                    <CategoryTitle>{category.category}</CategoryTitle>
                    {category.questions.map((question, index) => (
                      <SuggestionButton
                        key={index}
                        onClick={() => handleSuggestionClick(question)}
                      >
                        {question}
                      </SuggestionButton>
                    ))}
                  </CategoryContainer>
                ))}
              </SuggestionsContainer>
            )}
          </ErrorContainer>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {messages.length <= 1 && !error && (
        <SuggestionsContainer>
          <SuggestionsTitle>Try asking about:</SuggestionsTitle>
          {suggestions.slice(0, 1).map((category) => (
            <CategoryContainer key={category.category}>
              <CategoryTitle>{category.category}</CategoryTitle>
              {category.questions.slice(0, 2).map((question, index) => (
                <SuggestionButton
                  key={index}
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </SuggestionButton>
              ))}
            </CategoryContainer>
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
            {isLoading ? '⏳' : '📤'}
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChatIcon = styled.span`
  font-size: 18px;
`;

const OfflineIndicator = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  gap: 4px;
`;

const MessageContent = styled.div`
  background: ${props => props.theme?.role === 'user' ? '#667eea' : props.$isError ? '#fee' : '#f1f3f5'};
  color: ${props => props.theme?.role === 'user' ? 'white' : props.$isError ? '#c82333' : '#333'};
  border: ${props => props.$isError ? '1px solid #f5c6cb' : 'none'};
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-${props => props.theme?.role === 'user' ? 'right' : 'left'}-radius: 4px;
  max-width: 80%;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
  font-size: 14px;
  
  ${MessageBubble}[role="user"] & {
    background: #667eea;
    color: white;
  }
  
  ${MessageBubble}[role="assistant"] & {
    background: ${props => props.$isError ? '#fee' : '#f1f3f5'};
    color: ${props => props.$isError ? '#c82333' : '#333'};
    border: ${props => props.$isError ? '1px solid #f5c6cb' : 'none'};
  }
`;

const SourcesContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const SourcesLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.7;
`;

const SourceBadge = styled.span`
  display: inline-block;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  margin-right: 4px;
  margin-bottom: 2px;
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
  margin: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfidenceScore = styled.span`
  background: rgba(0, 0, 0, 0.1);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 10px;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f1f3f5;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
  animation-delay: ${props => props.delay};

  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ErrorContainer = styled.div`
  background: #fee;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
`;

const ErrorMessage = styled.div`
  color: #721c24;
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
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const SuggestionsTitle = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryContainer = styled.div`
  margin-bottom: 6px;
`;

const CategoryTitle = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: #888;
  margin-bottom: 3px;
  text-transform: uppercase;
`;

const SuggestionButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 3px 6px;
  font-size: 10px;
  margin: 1px 3px 1px 0;
  cursor: pointer;
  color: #667eea;
  line-height: 1.2;
  
  &:hover {
    background: #f0f2ff;
    border-color: #667eea;
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #e9ecef;
`;

const InputForm = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 20px;
  max-height: 60px;
  line-height: 1.4;
  outline: none;

  &:focus {
    border-color: #667eea;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background: ${props => props.disabled ? '#ccc' : '#667eea'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #5a6fd8;
    transform: scale(1.05);
  }
`;

const CharacterCount = styled.div`
  font-size: 11px;
  color: ${props => props.$warning ? '#dc3545' : '#999'};
  text-align: right;
  margin-top: 4px;
`;

export default ChatPanel;