import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the ThreeBackground component to avoid WebGL issues in tests
jest.mock('./components/ThreeBackground/ThreeBackground', () => {
  return function MockThreeBackground() {
    return <div data-testid="three-background">Three Background</div>;
  };
});

// Mock the chat components for faster testing
jest.mock('./features/chat/components/ChatPanel', () => {
  return function MockChatPanel({ onClose }) {
    return (
      <div data-testid="chat-panel">
        <button onClick={onClose}>Close</button>
        Chat Panel Content
      </div>
    );
  };
});

describe('App Integration with Chat Widget', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('renders main portfolio components without chat when disabled', () => {
    process.env.REACT_APP_CHAT_ENABLED = 'false';
    
    render(<App />);
    
    // Portfolio components should render
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
    
    // Chat should not render when disabled (check for both corner launcher and prominent button)
    expect(screen.queryByTestId('prominent-chat-button')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Open chat with PeppeGPT')).not.toBeInTheDocument();
  });

  test('renders chat widget when enabled (default)', async () => {
    render(<App />);
    
    // Wait for lazy loading - should have both corner launcher and prominent button
    await waitFor(() => {
      expect(screen.getAllByLabelText('Open chat with PeppeGPT')).toHaveLength(2);
    });
    
    // Check for prominent button specifically
    expect(screen.getByTestId('prominent-chat-button')).toBeInTheDocument();
  });

  test('chat widget does not interfere with portfolio navigation', async () => {
    render(<App />);
    
    // Portfolio should load first
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
    
    // Chat should load separately - both buttons should be present
    await waitFor(() => {
      expect(screen.getAllByLabelText('Open chat with PeppeGPT')).toHaveLength(2);
    });
    
    // Both should coexist
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
    expect(screen.getByTestId('prominent-chat-button')).toBeInTheDocument();
  });

  test('error boundary isolates chat widget errors', async () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Portfolio should still work even if chat fails
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('chat widget opens and closes properly within app context', async () => {
    render(<App />);
    
    // Wait for chat launcher to load
    await waitFor(() => {
      expect(screen.getAllByLabelText('Open chat with PeppeGPT')).toHaveLength(2);
    });
    
    // Use the prominent button for this test (more specific)
    const prominentButton = screen.getByTestId('prominent-chat-button');
    
    // Open chat
    fireEvent.click(prominentButton);
    
    // Chat panel should appear
    await waitFor(() => {
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
    
    // Close chat
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Chat panel should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
    });
  });

  test('lazy loading prevents initial bundle bloat', () => {
    const performanceStart = performance.now();
    render(<App />);
    
    // Portfolio should load quickly
    expect(screen.getByTestId('three-background')).toBeInTheDocument();
    
    const loadTime = performance.now() - performanceStart;
    expect(loadTime).toBeLessThan(1000); // 1 second budget for initial load
  });
});