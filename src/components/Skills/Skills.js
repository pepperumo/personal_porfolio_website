import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTools, FaRobot, FaDatabase, FaCode, FaCogs, FaLaptopCode } from 'react-icons/fa';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Engineering',
      icon: <FaTools />,
      skills: ['CAD Optimization', 'Quality Engineering', 'Finite Element Analysis']
    },
    {
      title: 'Data Science and MLOps',
      icon: <FaDatabase />,
      skills: ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Recommender Systems', 'Time-Series Analysis']
    },
    {
      title: 'Robotics',
      icon: <FaRobot />,
      skills: ['Autonomous Systems', 'Computer Vision', 'Reinforcement Learning', 'Robotic Process Design']
    }
  ];

  return (
    <SkillsSection id="skills">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle className="numbered-heading">Skills</SectionTitle>
        
        <SkillsContainer>
          {skillCategories.map((category, index) => (
            <SkillCategory 
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CategoryIcon>{category.icon}</CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
              <SkillList>
                {category.skills.map((skill, skillIndex) => (
                  <SkillItem key={skillIndex}>{skill}</SkillItem>
                ))}
              </SkillList>
            </SkillCategory>
          ))}
        </SkillsContainer>

        <TechnologiesSection>
          <TechnologiesTitle>Technologies I Work With</TechnologiesTitle>
          <TechnologiesContainer>
            <TechnologyCategory>
              <TechnologyCategoryTitle>
                <FaCode />
                <span>Programming</span>
              </TechnologyCategoryTitle>
              <TechnologyList>
                <TechnologyItem>Python (TensorFlow, PyTorch, Scikit-learn and more)</TechnologyItem>
                <TechnologyItem>C++</TechnologyItem>
                <TechnologyItem>Matlab</TechnologyItem>
                <TechnologyItem>Bash/Linux</TechnologyItem>
              </TechnologyList>
            </TechnologyCategory>

            <TechnologyCategory>
              <TechnologyCategoryTitle>
                <FaCogs />
                <span>CAD Software</span>
              </TechnologyCategoryTitle>
              <TechnologyList>
                <TechnologyItem>CATIA V5</TechnologyItem>
                <TechnologyItem>Autodesk Inventor</TechnologyItem>
                <TechnologyItem>SolidWorks</TechnologyItem>
              </TechnologyList>
            </TechnologyCategory>

            <TechnologyCategory>
              <TechnologyCategoryTitle>
                <FaLaptopCode />
                <span>Specialized Tools</span>
              </TechnologyCategoryTitle>
              <TechnologyList>
                <TechnologyItem>ANSYS Workbench</TechnologyItem>
                <TechnologyItem>ROS2</TechnologyItem>
                <TechnologyItem>AWS</TechnologyItem>
                <TechnologyItem>Microsoft Azure</TechnologyItem>
                <TechnologyItem>Git/Github</TechnologyItem>
              </TechnologyList>
            </TechnologyCategory>
          </TechnologiesContainer>
        </TechnologiesSection>
      </motion.div>
    </SkillsSection>
  );
};

const SkillsSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 0;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  margin-bottom: 40px;
  color: var(--text-primary);
`;

const SkillsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const SkillCategory = styled(motion.div)`
  background-color: var(--background-light);
  border-radius: 10px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 40px;
  color: var(--secondary-color);
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  font-size: 22px;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const SkillList = styled.ul`
  width: 100%;
`;

const SkillItem = styled.li`
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 10px;
  position: relative;
  padding-left: 20px;
  text-align: left;
  
  &:before {
    content: '▹';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
  }
`;

const TechnologiesSection = styled.div`
  margin-top: 30px;
`;

const TechnologiesTitle = styled.h3`
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
`;

const TechnologiesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
`;

const TechnologyCategory = styled.div`
  background-color: var(--background-light);
  border-radius: 10px;
  padding: 25px;
`;

const TechnologyCategoryTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: var(--secondary-color);
  margin-bottom: 20px;
  
  svg {
    font-size: 20px;
  }
`;

const TechnologyList = styled.ul`
  margin-left: 10px;
`;

const TechnologyItem = styled.li`
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 10px;
  position: relative;
  padding-left: 20px;
  
  &:before {
    content: '▹';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
  }
`;

export default Skills;
