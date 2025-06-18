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
  const languages = [
    { code: 'IT', name: 'Italian', level: 'Native', progress: 100 },
    { code: 'AL', name: 'Albanian', level: 'Native', progress: 100 },
    { code: 'GB', name: 'English', level: 'C1', progress: 90 },
    { code: 'FR', name: 'French', level: 'C1', progress: 90 },
    { code: 'ES', name: 'Spanish', level: 'C1', progress: 85 },
    { code: 'DE', name: 'German', level: 'B2', progress: 75 },
    { code: 'PT', name: 'Portuguese', level: 'B1', progress: 65 }
  ];

  return (
    <AboutMeContainer id="about-me">
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >          <IntroSection>
            <IntroContentBox>
              <NameAndDescriptionContainer>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >                <Greeting>Hello, my name is</Greeting>
                  <Name>Giuseppe Rumore</Name>
                  <JobTitle>Mechanical Engineer, Data Scientist, Machine Learning Engineer</JobTitle>
                  <SummaryDescription>
                   Skilled in harnessing data science and machine-learning techniques to transform engineering processes, 
                   optimise designs and improve overall performance. Extensive background in predictive analytics, AI-powered tools, plus deep hands-on expertise in CAD modelling and robotics to deliver innovative, efficient solutions.
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
                  </SocialLink>                <EmailLink 
                    href="mailto:giuseppe.rumore91@gmail.com" 
                    aria-label="Email Giuseppe Rumore"
                    title="Email"
                  >
                    <FaEnvelope />
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
            </IntroContentBox>
          </IntroSection>
          
          <LanguagesSection>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >              <LanguagesSectionTitle>Languages</LanguagesSectionTitle>
              <LanguagesSubtitle className="section-subtitle">Communicating effectively across borders and cultures.</LanguagesSubtitle>
              
              <LanguageCardsContainer>
                {languages.map((lang, index) => (
                  <LanguageCard key={index}>
                    <LanguageCode>{lang.code}</LanguageCode>
                    <LanguageName>
                      {lang.name} {lang.level !== 'Native' && `(${lang.level})`}
                    </LanguageName>
                    <LanguageProgressBar $progress={lang.progress} />
                  </LanguageCard>
                ))}
              </LanguageCardsContainer>
            </motion.div>
          </LanguagesSection>
          
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
  background-color: transparent;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 20px;
  
  @media (max-width: 1080px) {
    padding: 80px 20px;
  }
  
  @media (max-width: 768px) {
    padding: 80px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 60px 15px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  background: rgba(17, 34, 64, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 255, 218, 0.1);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 30px;
    padding: 30px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 15px;
    border-radius: 12px;
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
  background-image: url('${process.env.PUBLIC_URL}/profile.png');
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
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
  font-size: 18px;
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
  }
`;

// EmailText component removed as we no longer display the email address

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

const LanguagesSection = styled.div`
  margin: 100px 0;
  width: 100%;
`;

const LanguagesSectionTitle = styled.h2`
  font-size: clamp(42px, 6vw, 50px);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 15px 0;
`;

const LanguagesSubtitle = styled.p`
  /* Now using global style from GlobalStyles.js */
`;

const LanguageCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const LanguageCard = styled.div`
  background-color: rgba(17, 34, 64, 0.8);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const LanguageCode = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const LanguageName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 15px;
  text-align: center;
`;

const LanguageProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(100, 255, 218, 0.1);
  border-radius: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background-color: var(--secondary-color);
    border-radius: 2px;
  }
`;

// Added wrapper for Skills section
const SkillsWrapper = styled.div`
  margin-top: 100px;
  
  /* Cancel out the padding from the nested section-container */
  .section-container {
    padding: 0;
  }
  
  /* Apply consistent padding to the section */
  section {
    padding: 0;
  }
`;

export default AboutMe;
