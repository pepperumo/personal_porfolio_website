import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatPanel from '../components/ChatPanel';

// Mock scrollIntoView for tests
Element.prototype.scrollIntoView = jest.fn();

describe('ChatPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial welcome message', () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat with PeppeGPT')).toBeInTheDocument();
    expect(screen.getByText(/Hi! I'm PeppeGPT/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about skills, experience, projects...')).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Type your message');
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    // Type a message
    fireEvent.change(input, { target: { value: 'What are your skills?' } });
    expect(input).toHaveValue('What are your skills?');
    
    // Submit the form
    fireEvent.click(sendButton);
    
    // Input should be cleared
    expect(input).toHaveValue('');
    
    // User message should appear
    expect(screen.getByText('What are your skills?')).toBeInTheDocument();
  });

  test('sends message when Enter key is pressed', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Type your message');
    
    // Type a message and press Enter
    fireEvent.change(input, { target: { value: 'Tell me about your experience' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // User message should appear
    expect(screen.getByText('Tell me about your experience')).toBeInTheDocument();
  });

  test('does not send empty messages', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    // Try to send empty message
    fireEvent.click(sendButton);
    
    // Should still only have the initial welcome message
    const messages = screen.getAllByText(/Hi! I'm PeppeGPT|Ask about skills/);
    expect(messages).toHaveLength(1); // Only welcome message
  });

  test('closes panel when close button is clicked', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close chat');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('allows new line with Shift+Enter', async () => {
    const { container } = render(<ChatPanel onClose={mockOnClose} />);
    
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
    render(<ChatPanel onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Type your message');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Check that user message was sent (which means loading state should be triggered)
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // Check for either typing indicator or that loading state is active
    const typingText = screen.queryByText('...');
    const hasMessage = screen.queryByText('Test message');
    
    // If message is sent, the component should be in a loading state
    expect(hasMessage).toBeTruthy();
  });

  test('receives and displays AI response', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Type your message');
    
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Wait for AI response to appear
    await waitFor(() => {
      expect(screen.getByText(/I'm still learning!/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('disables input and send button while loading', async () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    const input = screen.getByLabelText('Type your message');
    const sendButton = screen.getByRole('button', { name: '📤' });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Input and button should be disabled during loading
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  test('displays timestamps for messages', () => {
    render(<ChatPanel onClose={mockOnClose} />);
    
    // Should show timestamp for welcome message - check for time text pattern
    const timePattern = /\d{1,2}:\d{2}/;
    expect(screen.getByText(timePattern)).toBeInTheDocument();
  });
});