import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TerminalSection from '../TerminalSection/TerminalSection';

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
        <TerminalSection title="Languages" subtitle="Communicating effectively across borders and cultures.">
          <LanguageCardsContainer>
            {languages.map((lang, index) => (
              <LanguageCard
                key={index}
                as={motion.div}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: [0, 0.6, 0.15, 0.85, 1], y: 0 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
              >
                <LanguageCode>{lang.code}</LanguageCode>
                <LanguageName>
                  {lang.name} {lang.level !== 'Native' && `(${lang.level})`}
                </LanguageName>
                <LanguageProgressBar $progress={lang.progress} />
              </LanguageCard>
            ))}
          </LanguageCardsContainer>
        </TerminalSection>
      </div>
    </LanguagesSection>
  );
};

const LanguagesSection = styled.section`
  /* Using global section styling from GlobalStyles.js */
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
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--glass-card-hover-shadow);
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
  background-color: rgba(0, 232, 162, 0.1);
  border-radius: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background-color: var(--secondary-color);
    border-radius: 0;
  }
`;

export default Languages;
