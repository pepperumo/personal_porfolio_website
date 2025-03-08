import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaCertificate } from 'react-icons/fa';

const Education = () => {
  const education = [
    {
      institution: 'INSA Lyon',
      degree: 'Master\'s Degree in Mechanical Engineering',
      year: '2014 - 2016',
      description: 'Specialized in fluid mechanics, thermal sciences, and mechanical design.'
    },
    {
      institution: 'RWTH Aachen University',
      degree: 'Exchange Program - Mechanical Engineering',
      year: '2015 - 2016',
      description: 'Focused on advanced mechanical engineering topics and research methods.'
    },
    {
      institution: 'Istituto Scientifico Statale Benedetto Croce di Palermo',
      degree: 'High School Diploma - Scientific Studies',
      year: '2009 - 2014',
      description: 'Strong foundation in mathematics, physics, and scientific methodologies.'
    },
    {
      institution: 'VIREG Project',
      degree: 'Specialized Training in Robotics & Automation',
      year: '2017',
      description: 'Intensive training program focusing on advanced robotics and automation technologies.'
    },
    {
      institution: '365 Data Science',
      degree: 'Data Science & Machine Learning Program',
      year: '2019',
      description: 'Comprehensive program covering data science fundamentals, machine learning, and AI applications.'
    }
  ];

  const certifications = [
    {
      title: 'Google Advanced Data Analytics Specialization',
      issuer: 'Google',
      year: '2022'
    },
    {
      title: 'ROS2 Development Certification',
      issuer: 'The Construct',
      year: '2021'
    },
    {
      title: 'Data Science Bootcamp',
      issuer: 'DataCamp',
      year: '2020'
    },
    {
      title: 'Microsoft Azure Fundamentals (AZ-900)',
      issuer: 'Microsoft',
      year: '2021'
    },
    {
      title: 'CATIA - CAD & FEM Certification',
      issuer: 'Dassault Systèmes',
      year: '2019'
    }
  ];

  return (
    <EducationSection id="education">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle className="numbered-heading">Education & Certifications</SectionTitle>
        
        <EducationContainer>
          <EducationCard>
            <CardHeader>
              <CardIcon>
                <FaGraduationCap />
              </CardIcon>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            
            <Timeline>
              {education.map((item, index) => (
                <TimelineItem 
                  key={index}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TimelinePoint />
                  <TimelineContent>
                    <TimelineInstitution>{item.institution}</TimelineInstitution>
                    <TimelineDegree>{item.degree}</TimelineDegree>
                    <TimelineYear>{item.year}</TimelineYear>
                    <TimelineDescription>{item.description}</TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </EducationCard>
          
          <EducationCard>
            <CardHeader>
              <CardIcon>
                <FaCertificate />
              </CardIcon>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            
            <CertificationsContainer>
              {certifications.map((cert, index) => (
                <CertificationItem 
                  key={index}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CertificationTitle>{cert.title}</CertificationTitle>
                  <CertificationInfo>
                    {cert.issuer} <span>•</span> {cert.year}
                  </CertificationInfo>
                </CertificationItem>
              ))}
            </CertificationsContainer>
          </EducationCard>
        </EducationContainer>
      </motion.div>
    </EducationSection>
  );
};

const EducationSection = styled.section`
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 0;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  margin-bottom: 40px;
  color: var(--text-primary);
`;

const EducationContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EducationCard = styled.div`
  background-color: var(--background-light);
  border-radius: 10px;
  padding: 30px;
  height: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
`;

const CardIcon = styled.div`
  font-size: 24px;
  color: var(--secondary-color);
  margin-right: 15px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  color: var(--text-primary);
`;

const Timeline = styled.div`
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 14px;
    top: 0;
    height: 100%;
    width: 2px;
    background-color: var(--tertiary-color);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding-left: 40px;
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelinePoint = styled.div`
  position: absolute;
  left: 7px;
  top: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  z-index: 1;
`;

const TimelineContent = styled.div``;

const TimelineInstitution = styled.h4`
  font-size: 18px;
  color: var(--secondary-color);
  margin-bottom: 5px;
`;

const TimelineDegree = styled.h5`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 5px;
`;

const TimelineYear = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  margin-bottom: 10px;
`;

const TimelineDescription = styled.p`
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const CertificationsContainer = styled.div`
  display: grid;
  gap: 20px;
`;

const CertificationItem = styled.div`
  background-color: rgba(100, 255, 218, 0.05);
  border-radius: 8px;
  padding: 20px;
  border-left: 3px solid var(--secondary-color);
`;

const CertificationTitle = styled.h4`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const CertificationInfo = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  
  span {
    margin: 0 8px;
    color: var(--secondary-color);
  }
`;

export default Education;
