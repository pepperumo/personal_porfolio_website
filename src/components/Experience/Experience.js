import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Experience = () => {
  const jobs = [
    {
      company: 'Steltix',
      role: 'JDEdwards Consultant',
      period: '12/2022 – 08/2024',
      field: 'Enterprise Resource Planning (ERP), Business Management Software',
      responsibilities: [
        'Comprehensive Business Management Solutions: Developed and optimized ERP solutions for manufacturing processes',
        'Integration and Production Planning: Monitored and maintained key systems for Bill of Materials (BOM), Materials Requirements Planning (MRP), Resource Planning (DRP)',
        'Operational Oversight: Supervised day-to-day operations, including product and materials routing, manufacturing workflows, and cost accounting, to ensure efficiency and accuracy across all tasks'
      ]
    },
    {
      company: 'IMI Climate Control',
      role: 'Mechanical Engineer | Data Analyst',
      period: '04/2017 – 07/2022',
      field: 'Heating Systems, Hydraulic Systems, Expansion Vessels, Vulcanization Processes',
      responsibilities: [
        'Data-Driven Testing and Analysis: Developed and optimized testing platforms, utilizing advanced data analysis techniques, increasing defect detection rates by 30% and reducing testing time by 20% for testing and hydraulic system products',
        'Production Optimization through Analytics: Conducted data analysis to optimize processes and systems cost-efficiency, leading to a 10% reduction in defects and 15% improvement in product performance',
        'Predictive Analytics for Problem Solving: Applied statistical modeling and predictive analytics to identify and address design and performance issues while enhancing product reliability',
        'Product Design: Enhanced the design of existing products to reduce production costs while maintaining quality and performance standards',
        '3D CAD Product Development: Designed and prototyped various hydraulic connectors for hydraulic and pneumatic components. Designed varying diameter, improving system compatibility and efficiency',
        'Robotic Automation: Procured and implemented robotic arms that automated assembly line processes, reducing setup time by 40%'
      ]
    },
    {
      company: 'ALTEN GmbH',
      role: 'Engineering Consultant (Overhead Systems)',
      period: '01/2017 – 04/2017',
      field: 'Automotive Overhead Systems',
      responsibilities: [
        'Logistics and Production Support: Helped streamline material flow and day-to-day build schedules, contributing to roughly a 7% reduction in line-stop incidents',
        'Supplier Collaboration: Acted as a junior point-of-contact between Ford and component suppliers, which trimmed average delivery variance by 4% and taught me the basics of relationship management in a global supply chain'
      ]
    },
    {
      company: 'European Patent Office',
      role: 'Contractor',
      period: '04/2016 – 12/2016',
      field: 'Patents, Machine Tools, Plastic Welding Procedures',
      responsibilities: [
        'Patent Management and Analysis: Managed patents related to machine tools and plastic welding procedures, employing innovative methods and data-driven approach to evaluate evaluation procedures',
        'Enhanced Technical Understanding: Leveraged analytical methodologies, particularly AI-driven methodologies, to improve technical report assessment, reducing average times by 40% and generating quality output',
        'Optimized Search Processes: Developed and implemented innovative tools and systematic techniques influenced by AI concepts, reducing patent search time by 20% and cutting average effort by 25%'
      ]
    }
  ];

  return (    <ExperienceSection id="experience">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        ><SectionTitle className="section-heading">Professional Journey</SectionTitle>
        <SectionSubtitle className="section-subtitle">
          A track record of leadership, innovation and driving successful outcomes.
        </SectionSubtitle>
        
        <JobsContainer>
          {jobs.map((job, index) => (
            <JobCard 
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CompanyName>{job.company}</CompanyName>
              <JobRole>{job.role}</JobRole>
              <JobPeriod>{job.period}</JobPeriod>
              <JobField>Field: {job.field}</JobField>
              <ResponsibilitiesList>
                {job.responsibilities.map((responsibility, idx) => (
                  <ResponsibilityItem key={idx}>
                    {responsibility}
                  </ResponsibilityItem>
                ))}              </ResponsibilitiesList>
            </JobCard>
          ))}
        </JobsContainer>
        </motion.div>
      </div>
    </ExperienceSection>
  );
};

const ExperienceSection = styled.section`
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

const JobsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const JobCard = styled(motion.div)`
  background-color: rgba(17, 34, 64, 0.8);
  border-radius: 10px;
  padding: 30px;
  border-left: 3px solid var(--secondary-color);
`;

const CompanyName = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 5px 0;
`;

const JobRole = styled.div`
  font-size: 16px;
  color: var(--secondary-color);
  margin-bottom: 5px;
`;

const JobPeriod = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  margin-bottom: 15px;
`;

const JobField = styled.div`
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-style: italic;
`;

const ResponsibilitiesList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;

const ResponsibilityItem = styled.li`
  position: relative;
  padding-left: 20px;
  margin-bottom: 15px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.5;
  
  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--secondary-color);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export default Experience;
