import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`  :root {
    --primary-color: #0a192f;
    --secondary-color: #64ffda;
    --secondary-light: #a8efda;
    --tertiary-color: #8892b0;
    --background-dark: #0a192f;
    --background-light: #112240;
    --text-primary: #ffffff;
    --text-secondary: #d6e0ff;
    --transition: all 0.3s ease-in-out;
    --font-primary: 'Inter', -apple-system, system-ui, sans-serif;
    --font-mono: 'Roboto Mono', monospace;
    --section-padding: 0 30px;
    --max-section-width: 1000px;
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
    background-color: var(--background-dark);
    background-image: linear-gradient(
      to right,
      rgba(10, 25, 47, 0.95),
      rgba(10, 25, 47, 0.8)
    ), url('${process.env.PUBLIC_URL}/background.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
  }

  a {
    text-decoration: none;
    color: var(--secondary-color);
    transition: var(--transition);
    
    &:hover {
      color: var(--text-primary);
    }
  }

  ul {
    list-style: none;
  }

  button, .btn {
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--secondary-color);
    color: var(--secondary-color);
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1;
    text-decoration: none;
    transition: var(--transition);
    
    &:hover, &:focus {
      background-color: rgba(100, 255, 218, 0.1);
      outline: none;
    }
  }

  section {
    margin: 0 auto;
    padding: 100px 0;
    
    @media (max-width: 1080px) {
      padding: 80px 0;
    }
    
    @media (max-width: 768px) {
      padding: 80px 0;
    }
    
    @media (max-width: 480px) {
      padding: 60px 0;
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

  /* Standard section title styling for consistency across components */
  h2.section-heading {
    font-size: clamp(42px, 6vw, 50px);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 15px 0;
  }

  /* Standard section subtitle styling */
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
    
    &:after {
      content: '';
      display: block;
      position: relative;
      width: 300px;
      height: 1px;
      margin-left: 20px;
      background-color: var(--tertiary-color);
      
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
  }

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
`;

export default GlobalStyles;
