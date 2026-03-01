import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Portfolio from './Portfolio';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const { motion, AnimatePresence } = require('../../__testutils__/mocks');
  return { motion, AnimatePresence, __esModule: true };
});

// Mock useScrollTyping — return full text immediately
jest.mock('../../hooks/useScrollTyping', () => (text) => ({
  displayed: text || '',
  done: true,
  ref: { current: null },
}));

describe('Portfolio', () => {
  test('renders all 8 project cards', () => {
    render(<Portfolio />);
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(8);
  });

  test('renders all 5 filter buttons', () => {
    render(<Portfolio />);
    const buttons = screen.getAllByRole('button');
    const filterTexts = buttons.map((b) => b.textContent);
    expect(filterTexts).toEqual(expect.arrayContaining(['All', 'Robotics', 'Ai', 'Engineering', 'MLOps']));
    expect(buttons).toHaveLength(5);
  });

  test('"All" filter is active by default', () => {
    render(<Portfolio />);
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(8);
  });

  test('filter by "ai" shows 5 projects', () => {
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'Ai' }));
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(5);
  });

  test('filter by "robotics" shows 1 project', () => {
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'Robotics' }));
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(1);
  });

  test('filter by "engineering" shows 1 project', () => {
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'Engineering' }));
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(1);
  });

  test('filter by "MLOps" shows 1 project', () => {
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'MLOps' }));
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    expect(githubLinks).toHaveLength(1);
  });

  test('switching back to "all" restores all projects', () => {
    render(<Portfolio />);
    fireEvent.click(screen.getByRole('button', { name: 'Ai' }));
    expect(screen.getAllByTitle('GitHub Repository')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getAllByTitle('GitHub Repository')).toHaveLength(8);
  });

  test('project cards have GitHub and external links', () => {
    render(<Portfolio />);
    const githubLinks = screen.getAllByTitle('GitHub Repository');
    const demoLinks = screen.getAllByTitle('Live Demo');
    expect(githubLinks.length).toBeGreaterThan(0);
    expect(demoLinks.length).toBeGreaterThan(0);
    githubLinks.forEach((link) => {
      expect(link.getAttribute('href')).toMatch(/github\.com/);
    });
  });

  test('"View More" links to GitHub profile', () => {
    render(<Portfolio />);
    const viewMore = screen.getByText('View More Projects');
    expect(viewMore).toBeInTheDocument();
    expect(viewMore.getAttribute('href')).toBe('https://github.com/pepperumo');
    expect(viewMore.getAttribute('target')).toBe('_blank');
  });
});
