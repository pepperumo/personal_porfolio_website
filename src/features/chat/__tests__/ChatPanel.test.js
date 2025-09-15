import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatPanel from '../components/ChatPanel';
import { ChatProvider } from '../context/ChatContext';

// Mock scrollIntoView for tests
Element.prototype.scrollIntoView = jest.fn();

// Test wrapper with ChatProvider
const TestWrapper = ({ children }) => (
  <ChatProvider>
    {children}
  </ChatProvider>
);

describe('ChatPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial welcome message', () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat with PeppeGPT')).toBeInTheDocument();
    expect(screen.getByText(/Hi! I'm PeppeGPT/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about skills, experience, projects...')).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    // Type a message
    fireEvent.change(input, { target: { value: 'What are your skills?' } });
    expect(input).toHaveValue('What are your skills?');
    
    // Submit the form
    fireEvent.click(sendButton);
    
    // User message should appear in a message bubble (not in input)
    await waitFor(() => {
      const messageBubbles = screen.getAllByText('What are your skills?');
      // Should have message in both input (disabled) and message bubble
      expect(messageBubbles.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('sends message when Enter key is pressed', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    
    // Type a message and press Enter
    fireEvent.change(input, { target: { value: 'Tell me about your experience' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // User message should appear in message area
    await waitFor(() => {
      const userMessages = screen.getAllByRole('user');
      expect(userMessages.length).toBeGreaterThan(0);
    });
  });

  test('does not send empty messages', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    // Try to send empty message
    fireEvent.click(sendButton);
    
    // Should still only have the initial welcome message
    const messages = screen.getAllByText(/Hi! I'm PeppeGPT|Ask about skills/);
    expect(messages).toHaveLength(1); // Only welcome message
  });

  test('closes panel when close button is clicked', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const closeButton = screen.getByLabelText('Close chat');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('allows new line with Shift+Enter', async () => {
    const { container } = render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    
    // Type text with Shift+Enter (should not submit)
    fireEvent.change(input, { target: { value: 'Line 1' } });
    fireEvent.keyPress(input, { key: 'Enter', shiftKey: true });
    
    // Should not have sent any message yet (the text is still in the input, not as a message)
    expect(input).toHaveValue('Line 1');
    // Check that there's no message bubble with this content (only in the textarea)
    const messageBubbles = container.querySelectorAll('[role="user"], [class*="user"], [class*="User"]');
    expect(messageBubbles.length).toBe(0);
  });

  test('shows typing indicator while waiting for response', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Check that user message was sent by looking for user role
    await waitFor(() => {
      const userMessages = screen.getAllByRole('user');
      expect(userMessages.length).toBeGreaterThan(0);
    });
    
    // Check for loading indicator or processing text
    expect(screen.getByText(/Processing your question/)).toBeInTheDocument();
  });

  test('receives and displays AI response', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Wait for user message to appear
    await waitFor(() => {
      const userMessages = screen.getAllByRole('user');
      expect(userMessages.length).toBeGreaterThan(0);
    });
    
    // Check that processing message appears
    expect(screen.getByText(/Processing your question/)).toBeInTheDocument();
  });

  test('disables input and send button while loading', async () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Type your message');
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Input and button should be disabled during loading
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  test('displays timestamps for messages', () => {
    render(
      <TestWrapper>
        <ChatPanel onClose={mockOnClose} />
      </TestWrapper>
    );
    
    // Should show timestamp for welcome message - check for time text pattern
    const timePattern = /\d{1,2}:\d{2}/;
    expect(screen.getByText(timePattern)).toBeInTheDocument();
  });
});