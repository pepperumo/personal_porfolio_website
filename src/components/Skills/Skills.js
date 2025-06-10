import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaCode, 
  FaBrain, 
  FaDocker, 
  FaRobot, 
  FaCube, 
  FaCogs
} from 'react-icons/fa';

const Skills = () => {
  const expertiseCategories = [
    {
      icon: <FaCode />,
      title: "Programming & Data",
      skills: [
        "Python (advanced)",
        "MATLAB",
        "SQL",
        "PySpark"
      ]
    },
    {
      icon: <FaBrain />,
      title: "ML / DL Frameworks",
      skills: [
        "scikit-learn",
        "TensorFlow",
        "Keras",
        "PyTorch"
      ]
    },
    {
      icon: <FaDocker />,
      title: "DevOps / MLOps",
      skills: [
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Git/GitHub"
      ]
    },
    {
      icon: <FaRobot />,
      title: "Robotics",
      skills: [
        "ROS 2 (Humble)",
        "Gazebo Fortress"
      ]
    },
    {
      icon: <FaCube />,
      title: "Simulation & CAD",
      skills: [
        "ANSYS Workbench",
        "CATIA V5/V6",
        "SolidWorks",
        "Autodesk Inventor",
        "AutoCAD"
      ]
    },
    {
      icon: <FaCogs />,
      title: "Other Technical Skills",
      skills: [
        "Big-data integration",
        "Predictive analytics",
        "Computer vision",
        "FEM analysis"
      ]
    }
  ];

  return (    <SkillsSection id="skills">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        ><SectionTitle className="section-heading">Skills</SectionTitle>
        <SectionSubtitle className="section-subtitle">
          Leveraging deep technical knowledge with strategic vision to deliver exceptional results.
        </SectionSubtitle>
        
        <ExpertiseGrid>
          {expertiseCategories.map((category, index) => (
            <ExpertiseCard 
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ExpertiseIcon>{category.icon}</ExpertiseIcon>
              <ExpertiseTitle>{category.title}</ExpertiseTitle>
              <SkillsList>
                {category.skills.map((skill, skillIndex) => (
                  <SkillItem key={skillIndex}>
                    <SkillBullet>•</SkillBullet>
                    <SkillText>{skill}</SkillText>
                  </SkillItem>
                ))}              </SkillsList>
            </ExpertiseCard>
          ))}
        </ExpertiseGrid>
        </motion.div>
      </div>
    </SkillsSection>
  );
};

const SkillsSection = styled.section`
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
  background-color: rgba(17, 34, 64, 0.8);
  border-radius: 10px;
  padding: 25px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
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
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillBullet = styled.span`
  color: var(--secondary-color);
  margin-right: 10px;
  font-size: 16px;
`;

const SkillText = styled.span`
  color: var(--text-secondary);
  font-size: 15px;
`;

export default Skills;
