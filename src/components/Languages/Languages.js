import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Languages = () => {
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
    <LanguagesSection id="languages">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle className="section-heading">Languages</SectionTitle>
          <SectionSubtitle className="section-subtitle">
            Communicating effectively across borders and cultures.
          </SectionSubtitle>
          
          <LanguageCardsContainer>
            {languages.map((lang, index) => (
              <LanguageCard 
                key={index}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <LanguageCode>{lang.code}</LanguageCode>
                <LanguageName>
                  {lang.name} {lang.level !== 'Native' && `(${lang.level})`}
                </LanguageName>
                <LanguageProgressBar $progress={lang.progress} />
              </LanguageCard>
            ))}
          </LanguageCardsContainer>
        </motion.div>
      </div>
    </LanguagesSection>
  );
};

const LanguagesSection = styled.section`
  /* Using global section styling from GlobalStyles.js */
`;

const SectionTitle = styled.h2`
  font-size: clamp(42px, 6vw, 50px);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 15px 0;
`;

const SectionSubtitle = styled.p`
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

export default Languages;
