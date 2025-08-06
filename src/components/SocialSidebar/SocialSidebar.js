import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const SocialSidebar = () => {
  return (
    <SidebarContainer
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <SocialIconsList>
        <SocialIconItem>
          <SocialLink 
            href="https://www.linkedin.com/in/giuseppe-rumore-b2599961" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            title="LinkedIn"
          >
            <FaLinkedin />
          </SocialLink>
        </SocialIconItem>
        <SocialIconItem>
          <SocialLink 
            href="https://github.com/pepperumo" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            title="GitHub"
          >
            <FaGithub />
          </SocialLink>
        </SocialIconItem>
        <SocialIconItem>
          <SocialLink 
            href="mailto:pepperumo@gmail.com" 
            aria-label="Email Giuseppe Rumore"
            title="Email"
          >
            <FaEnvelope />
          </SocialLink>
        </SocialIconItem>
      </SocialIconsList>
      <VerticalLine />
    </SidebarContainer>
  );
};

const SidebarContainer = styled(motion.div)`
  position: fixed;
  left: 40px;
  top: 50%; /* Center vertically */
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SocialIconsList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SocialIconItem = styled.li`
  margin-bottom: 25px;  /* Consistent spacing between icons */
`;

const SocialLink = styled.a`
  display: inline-block;
  color: var(--text-secondary);
  font-size: 22px; /* Consistent size with Home.js */
  transition: var(--transition);
  
  &:hover, &:focus {
    color: var(--secondary-color);
    transform: translateY(-3px);
  }
`;

// EmailLink removed as we're using SocialLink for all icons

const VerticalLine = styled.div`
  width: 1px;
  height: 100px;
  margin-top: 10px;
  background-color: var(--text-secondary);
`;

export default SocialSidebar;
