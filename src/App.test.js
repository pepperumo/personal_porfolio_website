import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Heavy mocks — keep App tests fast
jest.mock('./components/MatrixRain/MatrixRain', () => () => <div data-testid="matrix-rain" />);
jest.mock('./components/AvatarHero/AvatarHero', () => () => <div data-testid="avatar-hero" />);
jest.mock('./components/IntroAnimation/IntroAnimation', () =>
  ({ onComplete }) => (
    <div data-testid="intro-animation">
      <button onClick={onComplete}>complete</button>
    </div>
  )
);
jest.mock('framer-motion', () => {
  const { motion, AnimatePresence } = require('./__testutils__/mocks');
  return { motion, AnimatePresence, __esModule: true };
});
jest.mock('react-scroll', () => ({
  Link: ({ children, to, className, onClick, ...rest }) => (
    <a href={`#${to}`} className={className} onClick={onClick}>{children}</a>
  ),
  animateScroll: { scrollToTop: jest.fn() },
  Events: { scrollEvent: { register: jest.fn(), remove: jest.fn() } },
}));

describe('App', () => {
  test('renders IntroAnimation on load', () => {
    render(<App />);
    expect(screen.getByTestId('intro-animation')).toBeInTheDocument();
  });

  test('hides intro after onComplete fires', () => {
    render(<App />);
    fireEvent.click(screen.getByText('complete'));
    expect(screen.queryByTestId('intro-animation')).not.toBeInTheDocument();
  });

  test('renders all portfolio sections', () => {
    render(<App />);
    fireEvent.click(screen.getByText('complete'));

    const sectionIds = ['about-me', 'portfolio', 'skills', 'experience', 'education', 'contact', 'languages'];
    sectionIds.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  test('opens PeppeGPT sidebar via Home button', () => {
    render(<App />);
    fireEvent.click(screen.getByText('complete'));

    // The PeppeGPT button in Home has a <span> child wrapping the icon and text
    const peppeBtn = screen.getByRole('button', { name: /PeppeGPT/ });
    fireEvent.click(peppeBtn);

    expect(screen.getByLabelText('Close PeppeGPT')).toBeInTheDocument();
    expect(screen.getByTitle('PeppeGPT AI Assistant')).toBeInTheDocument();
  });

  test('closes PeppeGPT sidebar', () => {
    render(<App />);
    fireEvent.click(screen.getByText('complete'));

    fireEvent.click(screen.getByRole('button', { name: /PeppeGPT/ }));
    fireEvent.click(screen.getByLabelText('Close PeppeGPT'));

    expect(screen.queryByTitle('PeppeGPT AI Assistant')).not.toBeInTheDocument();
  });

  test('scroll progress bar starts at 0%', () => {
    render(<App />);
    const progressBar = document.querySelector('div[style*="width"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.style.width).toBe('0%');
  });
});
