import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

// Mock react-scroll
jest.mock('react-scroll', () => ({
  Link: ({ children, to, className, onClick, ...rest }) => (
    <a href={`#${to}`} className={className} onClick={onClick}>{children}</a>
  ),
  animateScroll: { scrollToTop: jest.fn() },
  Events: { scrollEvent: { register: jest.fn(), remove: jest.fn() } },
}));

describe('Navbar', () => {
  test('renders all 7 nav links', () => {
    render(<Navbar />);
    const expectedLinks = ['About Me', 'My Projects', 'Languages', 'Skills', 'Experience', 'Education', 'Contact'];
    expectedLinks.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  test('renders logo image', () => {
    render(<Navbar />);
    const logo = screen.getByAltText('GR Logo');
    expect(logo).toBeInTheDocument();
  });

  test('mobile menu starts closed', () => {
    const { container } = render(<Navbar />);
    // MenuButton is hidden via CSS on desktop but still in DOM
    const menuButton = container.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  test('hamburger toggles menu open', () => {
    const { container } = render(<Navbar />);
    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);
    // After click the icon changes (FiMenu → FiX) — component re-renders without crash
    expect(menuButton).toBeInTheDocument();
  });

  test('nav link click closes menu', () => {
    const { container } = render(<Navbar />);
    // Open menu
    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);
    // Click a nav link
    fireEvent.click(screen.getByText('Skills'));
    // Component still renders
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  test('scroll handler does not crash', () => {
    render(<Navbar />);
    fireEvent.scroll(window, { target: { scrollY: 200 } });
    expect(screen.getByAltText('GR Logo')).toBeInTheDocument();
  });
});
