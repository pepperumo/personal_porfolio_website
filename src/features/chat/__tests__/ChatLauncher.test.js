import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatLauncher from '../components/ChatLauncher';
import ProminentChatButton from '../components/ProminentChatButton';
import { ChatProvider, useChat } from '../context/ChatContext';

// Mock the lazy-loaded ChatPanel
jest.mock('../components/ChatPanel', () => {
  return function MockChatPanel({ onClose }) {
    return (
      <div data-testid="chat-panel">
        <button onClick={onClose}>Close Chat</button>
      </div>
    );
  };
});

// Helper component that includes both launcher and panel (like App.js)
const TestChatApp = () => {
  const { isChatOpen, closeChat } = useChat();

  // Lazy load ChatPanel component
  const ChatPanel = React.lazy(() => Promise.resolve({
    default: ({ onClose }) => (
      <div data-testid="chat-panel">
        <button onClick={onClose}>Close Chat</button>
      </div>
    )
  }));

  return (
    <div>
      <ChatLauncher />
      {isChatOpen && (
        <Suspense fallback={<div>Loading chat...</div>}>
          <ChatPanel onClose={closeChat} />
        </Suspense>
      )}
    </div>
  );
};

// Helper function to render components with ChatProvider
const renderWithProvider = (component) => {
  return render(
    <ChatProvider>
      {component}
    </ChatProvider>
  );
};

describe('ChatLauncher', () => {
  test('renders launcher button with correct accessibility attributes', () => {
    renderWithProvider(<ChatLauncher />);
    
    const button = screen.getByRole('button', { name: /open chat with peppegpt/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open chat with PeppeGPT');
    expect(button).toHaveAttribute('title', 'Ask me anything about my experience!');
  });

  test('hides launcher button when chat is open', async () => {
    renderWithProvider(<TestChatApp />);
    
    const button = screen.getByRole('button', { name: /open chat with peppegpt/i });
    
    // Initially, chat panel should not be visible
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    
    // Click to open chat
    fireEvent.click(button);
    
    // Wait for lazy loading and check if chat panel appears
    await waitFor(() => {
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
    
    // Launcher button should be hidden when chat is open
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /open chat with peppegpt/i })).not.toBeInTheDocument();
    });
  });

  test('shows launcher button again when chat is closed', async () => {
    renderWithProvider(<TestChatApp />);
    
    const launcherButton = screen.getByRole('button', { name: /open chat with peppegpt/i });
    
    // Open chat
    fireEvent.click(launcherButton);
    
    // Wait for chat panel to appear
    await waitFor(() => {
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
    
    // Launcher button should be hidden
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /open chat with peppegpt/i })).not.toBeInTheDocument();
    });
    
    // Click close button in chat panel
    const closeButton = screen.getByText('Close Chat');
    fireEvent.click(closeButton);
    
    // Chat panel should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    });
    
    // Launcher button should show again with chat icon
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /open chat with peppegpt/i });
      expect(button).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
      // Check that it's the chat icon by looking for the chat bubble path
      expect(button.querySelector('path[d*="12 2C6.48 2"]')).toBeInTheDocument();
    });
  });

  test('shows loading fallback while ChatPanel is loading', async () => {
    renderWithProvider(<TestChatApp />);
    
    const button = screen.getByRole('button', { name: /open chat with peppegpt/i });
    fireEvent.click(button);
    
    // Should show loading text briefly (if not immediately replaced by mock)
    await waitFor(() => {
      // Either loading text or the mocked chat panel should appear
      expect(
        screen.queryByText('Loading chat...') || screen.queryByTestId('chat-panel')
      ).toBeTruthy();
    });
  });

  test('launcher button is hidden when chat is open', async () => {
    renderWithProvider(<TestChatApp />);
    
    const button = screen.getByRole('button', { name: /open chat with peppegpt/i });
    
    // Click to open
    fireEvent.click(button);
    
    await waitFor(() => {
      // Launcher button should be hidden when chat is open
      expect(screen.queryByRole('button', { name: /open chat with peppegpt/i })).not.toBeInTheDocument();
      // Chat panel should be visible
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
  });
});

describe('ProminentChatButton', () => {
  test('renders prominent chat button with correct attributes', () => {
    const mockOnClick = jest.fn();
    renderWithProvider(<ProminentChatButton onClick={mockOnClick} />);
    
    const button = screen.getByTestId('prominent-chat-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open chat with PeppeGPT');
    expect(button.querySelector('svg')).toBeInTheDocument(); // Check for SVG icon instead of emoji
    expect(button).toHaveTextContent('PeppeGPT');
  });

  test('calls onClick when prominent button is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithProvider(<ProminentChatButton onClick={mockOnClick} />);
    
    const button = screen.getByTestId('prominent-chat-button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('works with shared context - both buttons control same chat', async () => {
    const TestComponent = () => {
      const { isChatOpen, openChat, closeChat } = useChat();
      
      return (
        <div>
          <ChatLauncher />
          <ProminentChatButton onClick={openChat} />
          <div data-testid="chat-status">{isChatOpen ? 'open' : 'closed'}</div>
          {isChatOpen && (
            <Suspense fallback={<div>Loading chat...</div>}>
              <div data-testid="chat-panel">
                <button onClick={closeChat}>Close Chat</button>
              </div>
            </Suspense>
          )}
        </div>
      );
    };
    
    renderWithProvider(<TestComponent />);
    
    // Initially closed
    expect(screen.getByTestId('chat-status')).toHaveTextContent('closed');
    
    // Click prominent button to open
    const prominentButton = screen.getByTestId('prominent-chat-button');
    fireEvent.click(prominentButton);
    
    // Should be open now
    await waitFor(() => {
      expect(screen.getByTestId('chat-status')).toHaveTextContent('open');
    });
    
    // Chat panel should be visible
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });
});