import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TerminalSection from '../TerminalSection/TerminalSection';
import {
  FaCode,
  FaBrain,
  FaDocker,
  FaRobot,
  FaCogs
} from 'react-icons/fa';

const Skills = () => {
  const expertiseCategories = [
    {
      icon: <FaCode />,
      title: "Programming & Data",
      skills: [
        { name: "Python", proficiency: 95 },
        { name: "JavaScript", proficiency: 80 },
        { name: "TypeScript", proficiency: 75 },
        { name: "MATLAB", proficiency: 75 },
        { name: "SQL", proficiency: 85 }
      ]
    },
    {
      icon: <FaRobot />,
      title: "AI Agents & Automation",
      skills: [
        { name: "LangChain", proficiency: 90 },
        { name: "LangGraph", proficiency: 85 },
        { name: "n8n", proficiency: 90 },
        { name: "RAG pipelines", proficiency: 88 }
      ]
    },
    {
      icon: <FaBrain />,
      title: "ML / DL Frameworks",
      skills: [
        { name: "scikit-learn", proficiency: 90 },
        { name: "TensorFlow", proficiency: 85 },
        { name: "Keras", proficiency: 85 },
        { name: "PyTorch", proficiency: 80 }
      ]
    },
    {
      icon: <FaDocker />,
      title: "DevOps / MLOps",
      skills: [
        { name: "Docker", proficiency: 88 },
        { name: "Kubernetes", proficiency: 70 },
        { name: "CI/CD", proficiency: 80 },
        { name: "Git/GitHub", proficiency: 92 }
      ]
    },
    {
      icon: <FaCogs />,
      title: "Other Technical Skills",
      skills: [
        { name: "Big-data integration", proficiency: 75 },
        { name: "Predictive analytics", proficiency: 85 },
        { name: "Computer vision", proficiency: 82 },
        { name: "FEM analysis", proficiency: 80 },
        { name: "CATIA V5/V6", proficiency: 78 },
        { name: "SolidWorks", proficiency: 75 },
        { name: "ANSYS Workbench", proficiency: 72 }
      ]
    }
  ];

  return (    <SkillsSection id="skills">
      <div className="section-container">
        <TerminalSection title="Skills" subtitle="Leveraging deep technical knowledge with strategic vision to deliver exceptional results.">
        <ExpertiseGrid>
          {expertiseCategories.map((category, index) => (
            <ExpertiseCard
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: [0, 0.6, 0.15, 0.85, 1], y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
            >
              <ExpertiseIcon>{category.icon}</ExpertiseIcon>
              <ExpertiseTitle>{category.title}</ExpertiseTitle>
              <SkillsList>
                {category.skills.map((skill, skillIndex) => (
                  <SkillItem key={skillIndex}>
                    <SkillHeader>
                      <SkillName>{skill.name}</SkillName>
                    </SkillHeader>
                    <SkillBarTrack>
                      <SkillBarFill
                        as={motion.div}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: skillIndex * 0.1, ease: "easeOut" }}
                      />
                    </SkillBarTrack>
                  </SkillItem>
                ))}
              </SkillsList>
            </ExpertiseCard>
          ))}
        </ExpertiseGrid>
        </TerminalSection>
      </div>
    </SkillsSection>
  );
};

const SkillsSection = styled.section`
  /* Using global section styling from GlobalStyles.js */
`;

const ExpertiseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 25px;
  }
`;

const ExpertiseCard = styled(motion.div)`
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--glass-card-hover-shadow);
  }
`;

const ExpertiseIcon = styled.div`
  color: var(--secondary-color);
  font-size: 28px;
  margin-bottom: 18px;
`;

const ExpertiseTitle = styled.h3`
  color: var(--text-primary);
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 500;
`;

const SkillsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SkillItem = styled.li`
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const SkillName = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
`;

const SkillBarTrack = styled.div`
  width: 100%;
  height: 7px;
  background: rgba(0, 232, 162, 0.1);
  border-radius: 0;
  overflow: hidden;
`;

const SkillBarFill = styled.div`
  height: 100%;
  background: var(--secondary-color);
  border-radius: 0;
`;

export default Skills;
