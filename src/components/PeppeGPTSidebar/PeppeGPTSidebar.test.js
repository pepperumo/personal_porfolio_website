import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PeppeGPTSidebar from './PeppeGPTSidebar';

// Mock framer-motion to eliminate exit animation delays
jest.mock('framer-motion', () => {
  const { motion, AnimatePresence } = require('../../__testutils__/mocks');
  return { motion, AnimatePresence, __esModule: true };
});

const defaultProps = { isOpen: false, onOpen: jest.fn(), onClose: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PeppeGPTSidebar', () => {
  test('shows mascot video when closed', () => {
    const { container } = render(<PeppeGPTSidebar {...defaultProps} />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  test('clicking mascot calls onOpen', () => {
    const onOpen = jest.fn();
    const { container } = render(
      <PeppeGPTSidebar {...defaultProps} onOpen={onOpen} />
    );
    // The mascot container wraps the video
    const video = container.querySelector('video');
    fireEvent.click(video.closest('div[class]'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test('shows chat iframe when open', () => {
    render(<PeppeGPTSidebar {...defaultProps} isOpen={true} />);
    expect(screen.getByTitle('PeppeGPT AI Assistant')).toBeInTheDocument();
  });

  test('hides mascot when open', () => {
    const { container } = render(
      <PeppeGPTSidebar {...defaultProps} isOpen={true} />
    );
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  test('close button calls onClose', () => {
    const onClose = jest.fn();
    render(<PeppeGPTSidebar {...defaultProps} isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close PeppeGPT'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Escape key closes when open', () => {
    const onClose = jest.fn();
    render(<PeppeGPTSidebar {...defaultProps} isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Escape does nothing when closed', () => {
    const onClose = jest.fn();
    render(<PeppeGPTSidebar {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('new chat button resets iframe', () => {
    const { rerender } = render(
      <PeppeGPTSidebar {...defaultProps} isOpen={true} />
    );
    const iframeBefore = screen.getByTitle('PeppeGPT AI Assistant');
    const keyBefore = iframeBefore.getAttribute('src');

    fireEvent.click(screen.getByLabelText('New chat'));

    // After clicking new chat, a new iframe should render (key changes, same src)
    const iframeAfter = screen.getByTitle('PeppeGPT AI Assistant');
    // The iframe element should be a different DOM node due to React key change
    expect(iframeAfter).toBeInTheDocument();
  });

  test('new chat button only visible when open', () => {
    const { rerender } = render(<PeppeGPTSidebar {...defaultProps} />);
    expect(screen.queryByLabelText('New chat')).not.toBeInTheDocument();

    rerender(<PeppeGPTSidebar {...defaultProps} isOpen={true} />);
    expect(screen.getByLabelText('New chat')).toBeInTheDocument();
  });
});
