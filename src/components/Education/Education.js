import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TerminalSection from '../TerminalSection/TerminalSection';

const Education = () => {
  const educationData = [
    {
      title: 'Data Science and MLOps',
      institution: 'Université Paris I Panthéon-Sorbonne (DataScientist.com)',
      period: '09/2024 – 06/2025',
      location: 'Berlin, Germany'
    },
    {
      title: 'Master of Science: Mechanical Engineering with Major in R&D',
      institution: 'INSA Lyon - Institut National Des Sciences Appliquées De Lyon',
      period: '09/2010 – 07/2015',
      location: 'Lyon, France'
    }
  ];

  return (    <EducationSection id="education">
      <div className="section-container">
        <TerminalSection title="Education" subtitle="Academic foundation supporting practical expertise.">
        <EducationCardsContainer>
          {educationData.map((edu, index) => (
            <EducationCard 
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: [0, 0.6, 0.15, 0.85, 1], y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
            >
              <EducationTitle>{edu.title}</EducationTitle>
              <EducationInstitution>{edu.institution}</EducationInstitution>
              <EducationPeriod>{edu.period}</EducationPeriod>
              <EducationLocation>{edu.location}</EducationLocation>            </EducationCard>
          ))}
        </EducationCardsContainer>
        </TerminalSection>
      </div>
    </EducationSection>
  );
};

const EducationSection = styled.section`
  /* Using global section styling from GlobalStyles.js */
`;

const EducationCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EducationCard = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--glass-card-hover-shadow);
  }
`;

const EducationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 15px 0;
`;

const EducationInstitution = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 10px;
`;

const EducationPeriod = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  margin-bottom: 5px;
  font-family: var(--font-mono);
`;

const EducationLocation = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
`;

export default Education;
