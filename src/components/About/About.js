import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const About = () => {
  const languages = ['Italian', 'French', 'English', 'Spanish', 'Portuguese', 'Albanian', 'German'];

  return (
    <AboutSection id="about">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle className="numbered-heading">About Me</SectionTitle>
        
        <AboutContentContainer>
          <AboutTextContainer>
            <AboutText>
              I am passionate about the intersection of Mechanical Engineering, Data Science, and Robotics, 
              driven by a desire to create intelligent solutions that solve real-world challenges.
            </AboutText>
            
            <AboutText>
              My background in mechanical engineering provides me with a solid foundation in physical systems, 
              while my expertise in data science and AI enables me to develop smart solutions that enhance 
              performance, efficiency, and functionality.
            </AboutText>
            
            <AboutText>
              I'm particularly interested in developing AI-driven robotics systems, autonomous technologies, 
              and innovative solutions that leverage machine learning to optimize mechanical designs and processes.
            </AboutText>
            
            <LanguageSection>
              <LanguageTitle>Languages I speak:</LanguageTitle>
              <LanguageList>
                {languages.map((language, index) => (
                  <LanguageItem key={index}>{language}</LanguageItem>
                ))}
              </LanguageList>
            </LanguageSection>
          </AboutTextContainer>
        </AboutContentContainer>
      </motion.div>
    </AboutSection>
  );
};

const AboutSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 70px 0;
  
  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 40px 0;
  font-size: clamp(26px, 5vw, 32px);
  font-weight: 600;
  color: var(--text-primary);
`;

const AboutContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const AboutTextContainer = styled.div`
  width: 100%;
`;

const AboutText = styled.p`
  margin-bottom: 20px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  
  &:last-of-type {
    margin-bottom: 30px;
  }
`;

const LanguageSection = styled.div`
  margin-top: 20px;
`;

const LanguageTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 15px;
`;

const LanguageList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const LanguageItem = styled.li`
  position: relative;
  margin: 0;
  padding: 8px 15px;
  background-color: rgba(100, 255, 218, 0.1);
  color: var(--secondary-color);
  border-radius: 5px;
  font-size: 14px;
  transition: var(--transition);
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.2);
    transform: translateY(-2px);
  }
`;

export default About;
