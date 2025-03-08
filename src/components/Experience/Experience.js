import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Experience = () => {
  const [activeTabId, setActiveTabId] = useState(0);

  const jobs = [
    {
      company: 'Steltix',
      position: 'Mechanical Engineer',
      period: 'Jan 2022 - Present',
      url: '#',
      description: [
        'Developed and implemented AI-driven solutions for mechanical engineering problems',
        'Optimized CAD designs for improved performance and manufacturability',
        'Collaborated with cross-functional teams to integrate intelligent systems in mechanical designs',
        'Applied machine learning techniques to predict mechanical system behaviors'
      ]
    },
    {
      company: 'IMI Climate Control',
      position: 'Technical Project Manager',
      period: 'Mar 2020 - Dec 2021',
      url: '#',
      description: [
        'Led technical projects from conception to completion, ensuring timely delivery',
        'Applied data-driven methodologies to optimize climate control systems',
        'Collaborated with engineering teams to implement innovative solutions',
        'Managed project resources and timelines to ensure successful outcomes'
      ]
    },
    {
      company: 'ALTEN GmbH',
      position: 'Project Engineer',
      period: 'Oct 2018 - Feb 2020',
      url: '#',
      description: [
        'Developed engineering solutions for automotive clients',
        'Conducted data analysis to improve product performance',
        'Collaborated with international teams on complex engineering challenges',
        'Implemented quality assurance processes to ensure product reliability'
      ]
    },
    {
      company: 'European Patent Office',
      position: 'Patent Examiner',
      period: 'May 2017 - Sep 2018',
      url: '#',
      description: [
        'Examined patent applications in the field of mechanical engineering',
        'Conducted prior art searches and analyzed technical documentation',
        'Assessed patent eligibility based on novelty, inventive step, and industrial applicability',
        'Provided detailed technical opinions on patentability'
      ]
    },
    {
      company: 'RWTH Aachen University',
      position: 'Research Assistant',
      period: 'Sep 2016 - Apr 2017',
      url: '#',
      description: [
        'Conducted research on fluid mechanics and thermal systems',
        'Developed computational models for fluid dynamics simulations',
        'Analyzed experimental data and prepared research reports',
        'Collaborated with academic and industry partners on research projects'
      ]
    },
    {
      company: 'Siemens Wind Power',
      position: 'Intern - Mechanical Engineer',
      period: 'Mar 2016 - Aug 2016',
      url: '#',
      description: [
        'Assisted in the design and optimization of wind turbine components',
        'Conducted structural analysis using FEM software',
        'Participated in product development meetings and contributed design ideas',
        'Collaborated with senior engineers on technical challenges'
      ]
    },
    {
      company: 'INSA Lyon',
      position: 'Research Intern',
      period: 'Jun 2015 - Sep 2015',
      url: '#',
      description: [
        'Participated in research projects focusing on mechanical engineering applications',
        'Conducted experiments and collected data for analysis',
        'Developed computational models to simulate mechanical phenomena',
        'Presented research findings to academic supervisors'
      ]
    },
    {
      company: 'SKF R&D Centre',
      position: 'Engineering Intern',
      period: 'Jan 2015 - May 2015',
      url: '#',
      description: [
        'Supported R&D activities in bearing technology development',
        'Conducted testing and analysis of bearing performance',
        'Assisted in the development of improved bearing designs',
        'Documented testing procedures and results for technical reports'
      ]
    }
  ];

  return (
    <ExperienceSection id="experience">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle className="numbered-heading">Where I've Worked</SectionTitle>
        
        <ExperienceContainer>
          <TabList role="tablist" aria-label="Job tabs">
            {jobs.map((job, i) => (
              <TabButton
                key={i}
                $isActive={activeTabId === i}
                onClick={() => setActiveTabId(i)}
                id={`tab-${i}`}
                role="tab"
                aria-selected={activeTabId === i}
                aria-controls={`panel-${i}`}
                tabIndex={activeTabId === i ? 0 : -1}
              >
                <span>{job.company}</span>
              </TabButton>
            ))}
            <Highlighter $activeTabId={activeTabId} $tabCount={jobs.length} />
          </TabList>

          <TabPanels>
            {jobs.map((job, i) => (
              <TabPanel
                key={i}
                $isActive={activeTabId === i}
                id={`panel-${i}`}
                role="tabpanel"
                aria-labelledby={`tab-${i}`}
                tabIndex={0}
              >
                <h3>
                  <JobTitle>{job.position}</JobTitle>
                  <JobCompany>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      @ {job.company}
                    </a>
                  </JobCompany>
                </h3>

                <JobDuration>{job.period}</JobDuration>

                <JobDescriptionList>
                  {job.description.map((bullet, j) => (
                    <JobDescriptionItem key={j}>{bullet}</JobDescriptionItem>
                  ))}
                </JobDescriptionList>
              </TabPanel>
            ))}
          </TabPanels>
        </ExperienceContainer>
      </motion.div>
    </ExperienceSection>
  );
};

const ExperienceSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 0;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  margin-bottom: 40px;
  color: var(--text-primary);
`;

const ExperienceContainer = styled.div`
  display: flex;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabList = styled.div`
  position: relative;
  z-index: 3;
  width: max-content;
  padding: 0;
  margin: 0;
  list-style: none;
  
  @media (max-width: 768px) {
    display: flex;
    overflow-x: auto;
    width: 100%;
    margin-bottom: 30px;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 20px 2px;
  border: none;
  border-left: 2px solid ${props => (props.$isActive ? 'var(--secondary-color)' : 'var(--background-light)')};
  background-color: transparent;
  color: ${props => (props.$isActive ? 'var(--secondary-color)' : 'var(--text-secondary)')};
  font-family: var(--font-mono);
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover,
  &:focus {
    background-color: var(--background-light);
    color: var(--secondary-color);
  }
  
  @media (max-width: 768px) {
    padding: 0 15px;
    border-left: 0;
    border-bottom: 2px solid ${props => (props.$isActive ? 'var(--secondary-color)' : 'var(--background-light)')};
  }
`;

const Highlighter = styled.div`
  position: absolute;
  top: ${props => props.$activeTabId * 42}px;
  left: 0;
  z-index: 10;
  width: 2px;
  height: 42px;
  border-radius: 4px;
  background: var(--secondary-color);
  transform: translateY(calc(${props => props.$activeTabId} * 42px));
  transition: transform 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  display: ${props => (props.$activeTabId >= 0 && props.$activeTabId < props.$tabCount ? 'block' : 'none')};
  
  @media (max-width: 768px) {
    top: auto;
    bottom: 0;
    width: 100%;
    max-width: ${props => 100 / props.$tabCount}%;
    height: 2px;
    margin-left: ${props => (props.$activeTabId / props.$tabCount) * 100}%;
    transform: translateX(0);
  }
`;

const TabPanels = styled.div`
  position: relative;
  width: 100%;
  margin-left: 20px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TabPanel = styled.div`
  width: 100%;
  height: auto;
  padding: 10px 5px;
  display: ${props => (props.$isActive ? 'block' : 'none')};
  
  h3 {
    margin-bottom: 5px;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.3;
  }
`;

const JobTitle = styled.span`
  color: var(--text-primary);
`;

const JobCompany = styled.span`
  color: var(--secondary-color);
  
  a {
    color: var(--secondary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const JobDuration = styled.p`
  margin-bottom: 25px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 13px;
`;

const JobDescriptionList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

const JobDescriptionItem = styled.li`
  position: relative;
  padding-left: 30px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 16px;
  
  &:before {
    content: '▹';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
  }
`;

export default Experience;
