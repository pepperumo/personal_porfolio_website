import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        ><SectionTitle className="section-heading">Education</SectionTitle>
        <SectionSubtitle className="section-subtitle">Academic foundation supporting practical expertise.</SectionSubtitle>
        
        <EducationCardsContainer>
          {educationData.map((edu, index) => (
            <EducationCard 
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <EducationTitle>{edu.title}</EducationTitle>
              <EducationInstitution>{edu.institution}</EducationInstitution>
              <EducationPeriod>{edu.period}</EducationPeriod>
              <EducationLocation>{edu.location}</EducationLocation>            </EducationCard>
          ))}
        </EducationCardsContainer>
        </motion.div>
      </div>
    </EducationSection>
  );
};

const EducationSection = styled.section`
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

const EducationCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EducationCard = styled.div`
  background-color: rgba(17, 34, 64, 0.8);
  border-radius: 10px;
  padding: 30px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
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
