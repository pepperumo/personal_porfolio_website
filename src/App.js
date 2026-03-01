import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from './components/Navigation/Navbar';
import AboutMe from './components/Home/Home';
import Experience from './components/Experience/Experience';
import Education from './components/Education/Education';
import Portfolio from './components/Portfolio/Portfolio';
import Languages from './components/Languages/Languages';
import Skills from './components/Skills/Skills';
import Contact from './components/Contact/Contact';
import SocialSidebar from './components/SocialSidebar/SocialSidebar';
import MatrixRain from './components/MatrixRain/MatrixRain';
import PeppeGPTSidebar from './components/PeppeGPTSidebar/PeppeGPTSidebar';
import IntroAnimation from './components/IntroAnimation/IntroAnimation';

function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [peppeGPTOpen, setPeppeGPTOpen] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const handleOpenPeppeGPT = useCallback(() => setPeppeGPTOpen(true), []);
  const handleClosePeppeGPT = useCallback(() => setPeppeGPTOpen(false), []);
  const lastInteraction = useRef(Date.now());
  const idleAngle = useRef(0);
  const idleRaf = useRef(null);

  useEffect(() => {
    const getScrollOffset = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      return maxScroll > 0 ? (window.scrollY / maxScroll) * 180 : 0;
    };

    const updateLight = (clientX, clientY) => {
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      const scrollOffset = getScrollOffset();
      const root = document.documentElement.style;
      root.setProperty('--light-x', `${x.toFixed(1)}%`);
      root.setProperty('--light-y', `${y.toFixed(1)}%`);
      root.setProperty('--light-angle', `${((x * 3.6 + scrollOffset) % 360).toFixed(1)}deg`);
      lastInteraction.current = Date.now();
      idleAngle.current = (x * 3.6 + scrollOffset) % 360;
    };

    const handleMouseMove = (e) => updateLight(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      updateLight(touch.clientX, touch.clientY);
    };

    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);

      if (Date.now() - lastInteraction.current <= 3000) {
        const scrollOffset = getScrollOffset();
        const root = document.documentElement.style;
        const currentBase = idleAngle.current - getScrollOffset() + scrollOffset;
        idleAngle.current = currentBase % 360;
        root.setProperty('--light-angle', `${idleAngle.current.toFixed(1)}deg`);
      }
    };

    // Idle animation — ambient chromatic rotation when no interaction
    const animateIdle = () => {
      if (Date.now() - lastInteraction.current > 3000) {
        idleAngle.current = (idleAngle.current + 0.15) % 360;
        const scrollOffset = getScrollOffset();
        const angle = (idleAngle.current + scrollOffset) % 360;
        const t = angle * (Math.PI / 180);
        const root = document.documentElement.style;
        root.setProperty('--light-angle', `${angle.toFixed(1)}deg`);
        root.setProperty('--light-x', `${(50 + Math.cos(t) * 30).toFixed(1)}%`);
        root.setProperty('--light-y', `${(50 + Math.sin(t) * 20).toFixed(1)}%`);
      }
      idleRaf.current = requestAnimationFrame(animateIdle);
    };
    idleRaf.current = requestAnimationFrame(animateIdle);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      if (idleRaf.current) cancelAnimationFrame(idleRaf.current);
    };
  }, []);

  return (
    <AppContainer>
      <GlobalStyles />
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}
      <ProgressBar style={{ width: `${scrollProgress}%` }} />
      <MatrixRain />
      <Navbar />
      <SocialSidebar />
      <AboutMe onOpenPeppeGPT={handleOpenPeppeGPT} />
      <Portfolio />
      <Languages />
      <Skills />
      <Experience />
      <Education />
      <Contact />
      <PeppeGPTSidebar
        isOpen={peppeGPTOpen}
        onOpen={handleOpenPeppeGPT}
        onClose={handleClosePeppeGPT}
      />
    </AppContainer>
  );
}

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--secondary-color);
  z-index: 1001;
  transition: width 0.1s linear;
`;

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;


export default App;
