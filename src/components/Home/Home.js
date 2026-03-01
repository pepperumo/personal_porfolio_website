import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { FaEnvelope, FaLinkedin, FaGithub, FaCalendarAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import AvatarHero from '../AvatarHero/AvatarHero';

// ── Typing effect hook ──
function useTypingEffect(text, speed = 50, delay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

// Create a wrapper for ScrollLink to handle props properly
const ScrollLinkWrapper = ({ className, children, smooth, ...props }) => (
  <ScrollLink 
    className={className} 
    smooth={smooth === true ? true : false}
    {...props}
  >
    {children}
  </ScrollLink>
);

const DESCRIPTION_ITEMS = [
  'Automation workflows that eliminate repetitive work',
  'Agentic AI systems that think and act autonomously',
  'RAG pipelines for intelligent document retrieval',
  'Custom chatbots tailored to your business',
];

const CALENDLY_URL = 'https://calendly.com/pepperumo/30min';


const CalendlyModal = ({ isOpen, onClose }) => {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <ModalHeader>
              <ModalTitle><FaCalendarAlt /> Book a Call</ModalTitle>
              <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
            </ModalHeader>
            <CalendlyIframe
              src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a0a1a&text_color=ffffff&primary_color=00e8a2`}
              title="Schedule a call with Giuseppe"
            />
          </ModalContent>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

const AboutMe = ({ onOpenPeppeGPT }) => {
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const { displayed: typedTitle, done: titleDone } = useTypingEffect(
    'AI Agent and Automation Engineer',
    45,
    800
  );
  return (
    <AboutMeContainer id="about-me">
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >          <IntroSection>
            <IntroContentBox>
              <TerminalHeader>
                <TerminalDot $color="#ff5f57" />
                <TerminalDot $color="#febc2e" />
                <TerminalDot $color="#28c840" />
                <TerminalHeaderTitle>~/about-me</TerminalHeaderTitle>
              </TerminalHeader>
              <IntroContentBody>
              <NameAndDescriptionContainer>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >                <Greeting>Hello, my name is</Greeting>
                  <Name>Giuseppe Rumore</Name>
                  <JobTitle>
                    {typedTitle}
                    <Cursor $hide={titleDone}>|</Cursor>
                  </JobTitle>
                  <BulletList>
                    {DESCRIPTION_ITEMS.map((item, i) => (
                      <BulletItem
                        key={i}
                        style={{ animationDelay: `${1.2 + i * 0.15}s` }}
                      >
                        {item}
                      </BulletItem>
                    ))}
                  </BulletList>
                </motion.div>

                <SocialLinksContainer>
                  <SocialLink 
                    href="https://www.linkedin.com/in/giuseppe-rumore-b2599961" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    title="LinkedIn"
                  >
                    <FaLinkedin />
                  </SocialLink>
                  <SocialLink 
                    href="https://github.com/pepperumo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    title="GitHub"
                  >
                    <FaGithub />
                  </SocialLink>                <EmailLink 
                    href="mailto:pepperumo@gmail.com" 
                    aria-label="Email Giuseppe Rumore"
                    title="Email"
                  >
                    <FaEnvelope />
                  </EmailLink>
                </SocialLinksContainer>
                
                <ButtonContainer>
                  <ExploreButton to="portfolio" smooth={true} duration={500} offset={-70}>
                    Explore my work
                  </ExploreButton>
                  <PeppeGPTButton onClick={onOpenPeppeGPT}>
                    <span><HiSparkles size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />PeppeGPT</span>
                  </PeppeGPTButton>
                  <BookCallButton onClick={() => setCalendlyOpen(true)}>
                    <FaCalendarAlt style={{ marginRight: 8 }} />
                    Book a Call
                  </BookCallButton>
                </ButtonContainer>
              </NameAndDescriptionContainer>
              
              <AvatarHero />
              </IntroContentBody>
            </IntroContentBox>
          </IntroSection>
        </motion.div>
      </ContentWrapper>
      <CalendlyModal isOpen={calendlyOpen} onClose={() => setCalendlyOpen(false)} />
    </AboutMeContainer>
  );
};

const AboutMeContainer = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-color: transparent;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 20px 30px 20px;
  
  @media (max-width: 1080px) {
    padding: 80px 20px 25px 20px;
  }
  
  @media (max-width: 768px) {
    padding: 80px 20px 20px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 60px 15px 15px 15px;
  }
`;

const IntroSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 30px;
  }
`;

const IntroContentBox = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  background: var(--glass-bg);
  border: var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
`;

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 8px;
`;

const TerminalDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TerminalHeaderTitle = styled.span`
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  margin-left: 8px;
`;

const IntroContentBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 30px;
    padding: 30px 20px;
  }

  @media (max-width: 480px) {
    padding: 25px 15px;
  }
`;

const NameAndDescriptionContainer = styled.div`
  max-width: 540px;
`;

const Greeting = styled.h3`
  margin: 0 0 20px 4px;
  color: var(--secondary-color);
  font-family: var(--font-mono);
  font-size: clamp(14px, 5vw, 16px);
  font-weight: 400;
  text-shadow: var(--glow);
`;

const Name = styled.h1`
  margin: 0;
  font-size: clamp(35px, 7vw, 70px);
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.1;
  text-shadow: var(--glow-strong);
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const wordReveal = keyframes`
  from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const Cursor = styled.span`
  color: var(--secondary-color);
  animation: ${blink} 0.7s step-end infinite;
  ${({ $hide }) => $hide && 'display: none;'}
`;

const BulletList = styled.ul`
  margin: 20px 0 30px;
  padding: 0;
  list-style: none;
`;

const BulletItem = styled.li`
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.4;
  opacity: 0;
  animation: ${wordReveal} 0.4s ease forwards;

  &::before {
    content: '>';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const JobTitle = styled.h2`
  margin: 10px 0 0 0;
  font-size: clamp(25px, 5vw, 30px);
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.1;
  min-height: 1.2em;
`;



const SocialLinksContainer = styled.div`
  display: flex;
  gap: 25px; /* Consistent spacing between icons, matching the sidebar */
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const SocialLink = styled.a`
  position: relative;
  color: var(--text-secondary);
  font-size: 22px; /* Match icon size with sidebar */
  transition: var(--transition);
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--secondary-color);
    transform: translateY(-3px);
    
    &::after {
      content: attr(title);
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--background-light);
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 10;
    }
  }
`;

const EmailLink = styled(SocialLink)`
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

// EmailText component removed as we no longer display the email address

const ButtonBase = styled(ScrollLinkWrapper)`
  position: relative;
  display: inline-block;
  padding: 12px 22px;
  font-family: var(--font-mono);
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ExploreButton = styled(ButtonBase)`
  background: var(--droplet-bg);
  color: var(--secondary-color);
  border: var(--droplet-border);
  box-shadow: var(--droplet-shadow);
  font-weight: 600;

  &:hover {
    background: rgba(0, 232, 162, 0.1);
    border-color: rgba(0, 232, 162, 0.6);
    box-shadow: 0 0 8px rgba(0, 232, 162, 0.2);
    color: var(--secondary-light);
    transform: translateY(-2px);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 8px rgba(0, 232, 162, 0.2), 0 0 16px rgba(0, 180, 216, 0.1);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 232, 162, 0.45), 0 0 32px rgba(0, 180, 216, 0.25), 0 0 48px rgba(124, 58, 237, 0.12);
  }
`;

const PeppeGPTButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  padding: 2px;
  border-radius: 6px;
  background: linear-gradient(135deg, #00e8a2, #00b4d8, #7c3aed);
  cursor: pointer;
  font-weight: 600;
  animation: ${pulseGlow} 2s ease-in-out infinite;

  /* Inner content area */
  & > span {
    display: block;
    padding: 10px 20px;
    white-space: nowrap;
    background: rgba(10, 10, 26, 0.92);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 13px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--secondary-color, #00e8a2);
    transition: background 0.3s ease;
  }

  &:hover {
    animation: none;
    box-shadow: 0 0 20px rgba(0, 232, 162, 0.5), 0 0 40px rgba(0, 180, 216, 0.3);
    transform: translateY(-2px);

    & > span {
      background: rgba(0, 232, 162, 0.08);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BookCallButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  font-family: var(--font-mono);
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
  transition: all 0.3s ease;
  background: var(--droplet-bg);
  color: var(--secondary-color);
  border: var(--droplet-border);
  box-shadow: var(--droplet-shadow);
  font-weight: 600;

  &:hover {
    background: rgba(0, 232, 162, 0.1);
    border-color: rgba(0, 232, 162, 0.6);
    box-shadow: 0 0 8px rgba(0, 232, 162, 0.2);
    color: var(--secondary-light);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 85vh;
  max-height: 750px;
  background: var(--glass-bg, rgba(10, 10, 26, 0.95));
  border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;

  @media (max-width: 520px) {
    max-width: 100%;
    height: 90vh;
    max-height: none;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(0, 232, 162, 0.08) 0%, transparent 100%);
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  color: var(--secondary-color, #00e8a2);
  font-family: var(--font-mono, 'Fira Code', monospace);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
`;

const CloseButton = styled.button`
  all: unset;
  cursor: pointer;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  font-size: 24px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CalendlyIframe = styled.iframe`
  width: 100%;
  flex: 1;
  border: none;
  min-height: 0;
`;

export default AboutMe;
