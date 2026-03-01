import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`  :root {
    --primary-color: #0a0a0a;
    --secondary-color: #00e8a2;
    --secondary-light: #33ffc0;
    --tertiary-color: #0a6e5a;
    --background-dark: #0a0a0a;
    --background-light: #0d1a0d;
    --text-primary: #00e8a2;
    --text-secondary: #c8f0e0;
    --transition: all 0.3s ease-in-out;
    --font-primary: 'Fira Code', 'Roboto Mono', 'SF Mono', 'Courier New', monospace;
    --font-mono: 'Fira Code', 'Roboto Mono', 'SF Mono', 'Courier New', monospace;
    --section-padding: 0 30px;
    --max-section-width: 1000px;
    --glow: 0 0 10px rgba(0, 232, 162, 0.3);
    --glow-strong: 0 0 20px rgba(0, 232, 162, 0.5), 0 0 40px rgba(0, 232, 162, 0.2);

    /* Terminal card tokens */
    --glass-bg: #0a0a0a;
    --glass-border: 1px solid rgba(0, 232, 162, 0.2);
    --glass-shadow: none;
    --glass-blur: none;
    --glass-radius: 6px;
    --glass-card-hover-shadow: 0 0 8px rgba(0, 232, 162, 0.15), 0 0 2px rgba(0, 232, 162, 0.3);

    /* Terminal button tokens */
    --droplet-bg: rgba(0, 232, 162, 0.06);
    --droplet-border: 1px solid rgba(0, 232, 162, 0.4);
    --droplet-shadow: none;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-primary);
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-dark);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
  }

  /* CRT scanline overlay */
  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.03) 0px,
      rgba(0, 0, 0, 0.03) 1px,
      transparent 1px,
      transparent 3px
    );
  }

  a {
    text-decoration: none;
    color: var(--secondary-color);
    transition: var(--transition);

    &:hover {
      color: var(--secondary-light);
      text-shadow: var(--glow);
    }
  }

  ul {
    list-style: none;
  }

  button, .btn {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background: var(--droplet-bg);
    border: var(--droplet-border);
    box-shadow: var(--droplet-shadow);
    color: var(--secondary-color);
    border-radius: 4px;
    padding: 0.75rem 1.25rem;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.3s ease;

    &:hover, &:focus {
      background: rgba(0, 232, 162, 0.1);
      border-color: rgba(0, 232, 162, 0.6);
      box-shadow: 0 0 8px rgba(0, 232, 162, 0.2);
      transform: translateY(-2px);
      outline: none;
    }
  }

  section {
    margin: 0 auto;
    padding: 60px 0;

    @media (max-width: 1080px) {
      padding: 50px 0;
    }

    @media (max-width: 768px) {
      padding: 40px 0;
    }

    @media (max-width: 480px) {
      padding: 30px 0;
    }
  }

  .section-container {
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;

    @media (max-width: 768px) {
      padding: 0 20px;
    }

    @media (max-width: 480px) {
      padding: 0 15px;
    }
  }

  h2.section-heading {
    font-size: clamp(42px, 6vw, 50px);
    font-weight: 600;
    color: var(--text-primary);
    text-shadow: var(--glow);
    margin: 0 0 15px 0;
  }

  p.section-subtitle {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0 0 40px 0;
    max-width: 650px;
  }

  .section-title {
    display: flex;
    align-items: center;
    position: relative;
    margin: 10px 0 40px;
    width: 100%;
    font-size: clamp(42px, 6vw, 50px);
    white-space: nowrap;
    text-shadow: var(--glow);

    &:after {
      content: '';
      display: block;
      position: relative;
      width: 300px;
      height: 1px;
      margin-left: 20px;
      background-color: var(--tertiary-color);
      box-shadow: var(--glow);

      @media (max-width: 768px) {
        width: 200px;
      }

      @media (max-width: 600px) {
        width: 100%;
      }
    }
  }

  .numbered-heading {
    font-size: clamp(26px, 5vw, 32px);
    margin: 10px 0 40px;
    color: var(--text-primary);
    text-shadow: var(--glow);
  }

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--background-dark);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--tertiary-color);
    &:hover { background: var(--secondary-color); }
  }

  ::selection {
    background: rgba(0, 232, 162, 0.3);
    color: #fff;
  }
`;

export default GlobalStyles;
