import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AboutMe from './Home';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const { motion, AnimatePresence } = require('../../__testutils__/mocks');
  return { motion, AnimatePresence, __esModule: true };
});

// Mock react-scroll
jest.mock('react-scroll', () => ({
  Link: ({ children, to, className, onClick, ...rest }) => (
    <a href={`#${to}`} className={className} onClick={onClick}>{children}</a>
  ),
  animateScroll: { scrollToTop: jest.fn() },
  Events: { scrollEvent: { register: jest.fn(), remove: jest.fn() } },
}));

// Mock AvatarHero (Three.js)
jest.mock('../AvatarHero/AvatarHero', () => () => <div data-testid="avatar-hero" />);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Home (AboutMe)', () => {
  test('renders greeting and name', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    expect(screen.getByText('Hello, my name is')).toBeInTheDocument();
    expect(screen.getByText('Giuseppe Rumore')).toBeInTheDocument();
  });

  test('types job title over time', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);

    // Initially the title should be empty or partial
    // After delay (800ms) + typing (45ms per char), it should appear
    act(() => { jest.advanceTimersByTime(800); }); // delay

    // Type a few characters
    act(() => { jest.advanceTimersByTime(500); });

    // Should have some partial text
    expect(screen.getByText(/AI Agent/)).toBeInTheDocument();
  });

  test('renders 4 description bullets', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    expect(screen.getByText(/Automation workflows/)).toBeInTheDocument();
    expect(screen.getByText(/Agentic AI systems/)).toBeInTheDocument();
    expect(screen.getByText(/RAG pipelines/)).toBeInTheDocument();
    expect(screen.getByText(/Custom chatbots/)).toBeInTheDocument();
  });

  test('social links present (LinkedIn, GitHub, Email)', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    expect(screen.getByLabelText('LinkedIn Profile')).toHaveAttribute('href', 'https://www.linkedin.com/in/giuseppe-rumore-b2599961');
    expect(screen.getByLabelText('GitHub Profile')).toHaveAttribute('href', 'https://github.com/pepperumo');
    expect(screen.getByLabelText('Email Giuseppe Rumore')).toHaveAttribute('href', 'mailto:pepperumo@gmail.com');
  });

  test('PeppeGPT button calls callback', () => {
    const onOpenPeppeGPT = jest.fn();
    render(<AboutMe onOpenPeppeGPT={onOpenPeppeGPT} />);
    fireEvent.click(screen.getByText('PeppeGPT'));
    expect(onOpenPeppeGPT).toHaveBeenCalledTimes(1);
  });

  test('"Book a Call" opens Calendly modal', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    fireEvent.click(screen.getByText('Book a Call'));
    expect(screen.getByTitle('Schedule a call with Giuseppe')).toBeInTheDocument();
  });

  test('close button closes modal', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    fireEvent.click(screen.getByText('Book a Call'));
    expect(screen.getByTitle('Schedule a call with Giuseppe')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByTitle('Schedule a call with Giuseppe')).not.toBeInTheDocument();
  });

  test('Escape closes modal', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    fireEvent.click(screen.getByText('Book a Call'));
    expect(screen.getByTitle('Schedule a call with Giuseppe')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTitle('Schedule a call with Giuseppe')).not.toBeInTheDocument();
  });

  test('backdrop click closes modal', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    fireEvent.click(screen.getByText('Book a Call'));

    // The backdrop is the ModalBackdrop div. We need to click it directly.
    // It has `onClick={handleBackdropClick}` which checks e.target === e.currentTarget.
    const iframe = screen.getByTitle('Schedule a call with Giuseppe');
    const backdrop = iframe.closest('div[class]').parentElement;
    // Fire click on the outermost modal container
    fireEvent.click(backdrop);
    expect(screen.queryByTitle('Schedule a call with Giuseppe')).not.toBeInTheDocument();
  });

  test('"Explore my work" link exists', () => {
    render(<AboutMe onOpenPeppeGPT={jest.fn()} />);
    const link = screen.getByText('Explore my work');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('#portfolio');
  });
});
