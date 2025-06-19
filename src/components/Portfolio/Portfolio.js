import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

const Portfolio = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const categories = ['all', 'robotics', 'ai', 'engineering', 'MLOps'];

  useEffect(() => {
    // Simulated data - this would typically come from an API or CMS
    const projectData = [
      {        title: <a href="https://www.linkedin.com/pulse/crypto-foresight-ai-powered-platform-real-time-giuseppe-rumore-e38lf/?trackingId=labKh5L7TbyvzyeYqmp7%2BQ%3D%3D" target="_blank" rel="noopener noreferrer">Crypto Foresight</a>,
        description: 'AI-powered price forecasting platform for cryptocurrency using advanced machine learning models.',
        image: `${process.env.PUBLIC_URL}/Forecast.png`,
        technologies: ['Python', 'Machine Learning', 'React.js', 'Time Series Forecasting', 'Data Visualization'],
        github: 'https://github.com/pepperumo/crypto-forecasting',
        external: 'https://www.linkedin.com/pulse/crypto-foresight-ai-powered-platform-real-time-giuseppe-rumore-e38lf/?trackingId=labKh5L7TbyvzyeYqmp7%2BQ%3D%3D',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://huggingface.co/spaces/pepperumo/MVTec_Website" target="_blank" rel="noopener noreferrer">MVTEC Anomaly Detection</a>,
        description: 'An anomaly detection system APP, detecting defects on products.',
        image: `${process.env.PUBLIC_URL}/anomaly_visual_example.png`,
        technologies: ['Python', 'PyTorch', 'Computer Vision', 'Convolutional Neural Networks'],
        github: 'https://github.com/pepperumo/MVTEC-anomaly-detection',
        external: 'https://huggingface.co/spaces/pepperumo/MVTec_Website',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://www.linkedin.com/pulse/optimizing-cad-designs-using-genetic-algorithms-giuseppe-rumore-gpoif/" target="_blank" rel="noopener noreferrer">CAD Design Optimization with Genetic Algorithms</a>,
        description: 'A genetic algorithm-based optimization framework for CAD designs.',
        image: `${process.env.PUBLIC_URL}/Clamp_sizes.png`,
        technologies: ['Python', 'CAD', 'Genetic Algorithms', 'Finite Element Analysis'],
        github: 'https://github.com/pepperumo/FreeCAD-genetic-algorithm_FEA',
        external: 'https://www.linkedin.com/pulse/optimizing-cad-designs-using-genetic-algorithms-giuseppe-rumore-gpoif/',
        category: 'engineering',
        featured: true
      },
      {
        title: <a href="https://www.linkedin.com/pulse/self-driving-ros-2-giuseppe-rumore-l6wzf/" target="_blank" rel="noopener noreferrer">ROS2 Bumperbot</a>,
        description: 'A self-driving robot using ROS2, C++, Python and Gazebo. ',
        image: `${process.env.PUBLIC_URL}/bumperbot.png`,
        technologies: ['ROS2', 'C++', 'Python', 'Gazebo'],
        github: 'https://github.com/pepperumo/Differential_self_driving_Robot_bumperbot',
        external: 'https://www.linkedin.com/pulse/self-driving-ros-2-giuseppe-rumore-l6wzf/',
        category: 'robotics',
        featured: false
      },      {
        title: <a href="https://huggingface.co/spaces/pepperumo/book_recommender_streamlit" target="_blank" rel="noopener noreferrer">AI-Powered Recommendation APP</a>,
        description: 'A recommendation system using collaborative filtering and deep learning techniques.',
        image: `${process.env.PUBLIC_URL}/books.jpg`,
        technologies: ['Python', 'TensorFlow', 'FastAPI', 'TypeScript', 'Streamlit'],
        github: 'https://github.com/pepperumo/MLOps_book_recommender_system',
        external: 'https://huggingface.co/spaces/pepperumo/book_recommender_streamlit',
        category: 'MLOps',
        featured: false
      }
    ];
    
    setProjects(projectData);
    setFilteredProjects(projectData);
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === filter));
    }
  }, [filter, projects]);

  return (    <PortfolioSection id="portfolio">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        ><SectionTitle className="section-heading">My Projects</SectionTitle>
        <SectionSubtitle className="section-subtitle">A showcase of my technical projects and professional work.</SectionSubtitle>
        
        <FilterContainer>
          {categories.map((category, index) => (
            <FilterButton 
              key={index}
              $active={filter === category}
              onClick={() => setFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </FilterButton>
          ))}
        </FilterContainer>

        <ProjectsGrid>
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              $featured={project.featured}
            >              <ProjectImageContainer>
                <ProjectImage src={project.image} alt={project.title} />
              </ProjectImageContainer>
              <ProjectContent>
                <ProjectCategory>{project.category}</ProjectCategory>
                <ProjectTitle>{project.title}</ProjectTitle>
                <ProjectDescription>{project.description}</ProjectDescription>
                <ProjectTechList>
                  {project.technologies.map((tech, i) => (
                    <ProjectTechItem key={i}>{tech}</ProjectTechItem>
                  ))}
                </ProjectTechList>
                <ProjectLinks>
                  {project.github && (
                    <ProjectLink href={project.github} target="_blank" rel="noopener noreferrer" title="GitHub Repository">
                      <FiGithub />
                    </ProjectLink>
                  )}
                  {project.external && (
                    <ProjectLink href={project.external} target="_blank" rel="noopener noreferrer" title="Live Demo">
                      <FiExternalLink />
                    </ProjectLink>
                  )}
                </ProjectLinks>
              </ProjectContent>
            </ProjectCard>
          ))}
        </ProjectsGrid>
        
        <ViewMoreButton 
          href="https://github.com/pepperumo" 
          target="_blank" 
          rel="noopener noreferrer"        >
          View More Projects
        </ViewMoreButton>
        </motion.div>
      </div>
    </PortfolioSection>
  );
};

const PortfolioSection = styled.section`
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

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;
`;

const FilterButton = styled.button`
  background: ${props => (props.$active ? 'var(--tertiary-color)' : 'transparent')};
  color: ${props => (props.$active ? 'var(--text-primary)' : 'var(--text-secondary)')};
  border: 1px solid var(--tertiary-color);
  border-radius: 5px;
  padding: 8px 16px;
  margin: 0 10px 10px 0;
  font-size: 14px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background: rgba(100, 255, 218, 0.1);
    color: var(--secondary-color);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
`;

const ProjectCard = styled.div`
  background-color: var(--background-light);
  border-radius: 5px;
  overflow: hidden;
  transition: transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: ${props => props.$featured ? '1px solid var(--tertiary-color)' : 'none'};
  box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);
  
  &:hover {
    transform: translateY(-7px);
  }
`;

const ProjectImageContainer = styled.div`
  position: relative;
  height: 0;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
`;

const ProjectImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProjectImageContainer}:hover & {
    transform: scale(1.05);
  }
`;

const ProjectLinks = styled.div`
  display: flex;
  margin-top: 15px;
  justify-content: flex-end;
`;

const ProjectLink = styled.a`
  color: var(--text-secondary);
  font-size: 20px;
  margin: 0 10px;
  transition: color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    color: var(--secondary-color);
    transform: translateY(-3px);
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const ProjectContent = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProjectCategory = styled.span`
  color: var(--secondary-color);
  font-family: var(--font-mono);
  font-size: 13px;
  margin-bottom: 10px;
  text-transform: capitalize;
`;

const ProjectTitle = styled.h3`
  color: var(--text-primary);
  font-size: 22px;
  margin-bottom: 10px;
  
  a {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--secondary-color);
    }
  }
`;

const ProjectDescription = styled.p`
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
`;

const ProjectTechList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
`;

const ProjectTechItem = styled.li`
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  margin-right: 15px;
  margin-bottom: 5px;
  white-space: nowrap;
  
  &:before {
    content: '▹';
    color: var(--secondary-color);
    margin-right: 5px;
  }
`;

const ViewMoreButton = styled.a`
  color: var(--secondary-color);
  background-color: transparent;
  border: 1px solid var(--secondary-color);
  border-radius: 5px;
  padding: 15px 20px;
  font-size: 14px;
  font-family: var(--font-mono);
  text-decoration: none;
  text-align: center;
  margin: 50px auto 0;
  display: block;
  width: fit-content;
  transition: var(--transition);
  
  &:hover {
    background-color: rgba(100, 255, 218, 0.1);
  }
`;

export default Portfolio;
