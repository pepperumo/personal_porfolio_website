import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';

const Contact = () => {
  return (
    <ContactSection id="contact">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>Contact Me</SectionTitle>
        
        <ContactContent>
          <ContactText>
            I'm currently open to new opportunities and collaborations. Feel free to reach out through any of the following channels:
          </ContactText>
          
          <ContactLinksContainer>
            <ContactItem 
              href="mailto:pepperumo@gmail.com"
              aria-label="Email Giuseppe Rumore"
            >
              <ContactItemIcon>
                <FaEnvelope />
              </ContactItemIcon>
              <ContactItemText>pepperumo@gmail.com</ContactItemText>
            </ContactItem>
            
            <ContactItem 
              href="https://www.linkedin.com/in/giuseppe-rumore-b2599961"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <ContactItemIcon>
                <FaLinkedin />
              </ContactItemIcon>
              <ContactItemText>LinkedIn</ContactItemText>
            </ContactItem>
            
            <ContactItem 
              href="https://github.com/pepperumo"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <ContactItemIcon>
                <FaGithub />
              </ContactItemIcon>
              <ContactItemText>GitHub</ContactItemText>
            </ContactItem>
          </ContactLinksContainer>
        </ContactContent>
      </motion.div>
    </ContactSection>
  );
};

const ContactSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 0;
  
  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 40px 0;
  font-size: clamp(42px, 6vw, 50px);
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
`;

const ContactContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContactText = styled.p`
  margin-bottom: 40px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary);
  text-align: center;
  max-width: 600px;
`;

const ContactLinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
  max-width: 500px;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-radius: 5px;
  background-color: var(--background-light);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background-color: rgba(100, 255, 218, 0.1);
    color: var(--secondary-color);
    box-shadow: 0 10px 30px -15px var(--shadow-color);
  }
`;

const ContactItemIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: rgba(100, 255, 218, 0.1);
  margin-right: 15px;
  font-size: 20px;
  color: var(--secondary-color);
`;

const ContactItemText = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

export default Contact;
