import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import Skills from '../Skills/Skills';

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

const AboutMe = () => {
  const languages = ['Italian', 'French', 'English', 'Spanish', 'Portuguese', 'Albanian', 'German'];

  return (
    <AboutMeContainer id="about-me">
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IntroSection>
            <NameAndDescriptionContainer>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Greeting>Hello, my name is</Greeting>
                <Name>Giuseppe Rumore</Name>
                <JobTitle>Mechanical Engineer, Data Scientist, Robotics Engineer</JobTitle>
                <SummaryDescription>
                  Based in Berlin, Germany, I specialize in creating and optimizing solutions at the intersection of 
                  Mechanical Engineering, Data Science, and Robotics.
                </SummaryDescription>
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
                </SocialLink>
                <EmailLink 
                  href="mailto:giuseppe.rumore91@gmail.com" 
                  aria-label="Email Giuseppe Rumore"
                >
                  <FaEnvelope />
                  <EmailText>giuseppe.rumore91@gmail.com</EmailText>
                </EmailLink>
              </SocialLinksContainer>
              
              <ExploreButton to="portfolio" smooth={true} duration={500} offset={-70}>
                Explore my work
              </ExploreButton>
            </NameAndDescriptionContainer>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ProfileImageContainer>
                <ProfileImage />
              </ProfileImageContainer>
            </motion.div>
          </IntroSection>
          
          <AboutContentContainer>
            <AboutTextContainer>
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
          
          {/* Integrated Skills Section */}
          <SkillsWrapper>
            <Skills />
          </SkillsWrapper>
        </motion.div>
      </ContentWrapper>
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
  background-image: linear-gradient(
    to right,
    rgba(10, 25, 47, 0.95),
    rgba(10, 25, 47, 0.8)
  ), url('/background.jpg');
  background-color: var(--background-dark);
  background-size: cover;
  background-position: center;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 50px;
  
  @media (max-width: 1080px) {
    padding: 70px 100px;
  }
  
  @media (max-width: 768px) {
    padding: 50px 50px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 25px;
  }
`;

const IntroSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 30px;
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
`;

const Name = styled.h1`
  margin: 0;
  font-size: clamp(35px, 7vw, 70px);
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.1;
`;

const JobTitle = styled.h2`
  margin: 10px 0 0 0;
  font-size: clamp(25px, 5vw, 30px);
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.1;
`;

const SummaryDescription = styled.p`
  margin: 20px 0 30px;
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ProfileImageContainer = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid var(--secondary-color);
  
  @media (max-width: 768px) {
    width: 280px;
    height: 280px;
  }
  
  @media (max-width: 480px) {
    width: 260px;
    height: 260px;
  }
`;

const ProfileImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/profile.jpg');
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const SocialLinksContainer = styled.div`
  display: flex;
  gap: 20px;
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
  font-size: 24px;
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
  font-size: 18px;
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
  }
`;

const EmailText = styled.span`
  margin-left: 8px;
  font-family: var(--font-mono);
  font-size: 14px;
`;

const ButtonBase = styled(ScrollLinkWrapper)`
  display: inline-block;
  padding: 12px 24px;
  font-family: var(--font-mono);
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  text-decoration: none;
  transition: var(--transition);
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ExploreButton = styled(ButtonBase)`
  background-color: var(--secondary-color);
  color: var(--background-dark);
  border: 1px solid var(--secondary-color);
  
  &:hover {
    background-color: var(--secondary-light);
    transform: translateY(-3px);
  }
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

// Added wrapper for Skills section
const SkillsWrapper = styled.div`
  margin-top: 60px;
  
  /* Override some of the Skills component styling to fit better in the Home page */
  section {
    padding: 0;
  }
`;

export default AboutMe;
