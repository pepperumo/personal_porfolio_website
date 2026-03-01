import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import TerminalSection from '../TerminalSection/TerminalSection';

const Portfolio = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const categories = ['all', 'robotics', 'ai', 'engineering', 'MLOps'];

  useEffect(() => {
    // Simulated data - this would typically come from an API or CMS
    const projectData = [
      {
        title: <a href="https://peppegpt.giusepperumore.com/" target="_blank" rel="noopener noreferrer">PeppeGPT</a>,
        titleText: 'PeppeGPT',
        description: 'Full-stack AI chatbot with React, TypeScript, FastAPI, and Shadcn UI. Features autonomous AI agents using LangGraph for multi-step reasoning, RAG pipeline with Neo4j knowledge graph, n8n workflows for document ingestion, and containerized microservices with multi-LLM provider support.',
        image: `${process.env.PUBLIC_URL}/peppegpt.png`,
        technologies: ['React', 'TypeScript', 'FastAPI', 'LangGraph', 'Neo4j', 'n8n', 'Docker', 'RAG'],
        github: 'https://github.com/pepperumo/peppegpt',
        external: 'https://peppegpt.giusepperumore.com/',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://www.linkedin.com/pulse/agentic-rag-actually-answers-your-question-why-i-built-rumore-nycre/" target="_blank" rel="noopener noreferrer">Agentic RAG on n8n</a>,
        titleText: 'Agentic RAG on n8n',
        description: 'Agentic RAG that routes each question to the right capability (semantic search, full-document retrieval, or SQL over structured data)coordinated by n8n for higher answer quality and transparency.',
        image: `${process.env.PUBLIC_URL}/n8n.png`,
        technologies: ['n8n', 'RAG', 'Agents', 'Semantic Search', 'SQL', 'Retrieval'],
        github: 'https://github.com/pepperumo/n8n_worflows',
        external: 'https://www.linkedin.com/pulse/agentic-rag-actually-answers-your-question-why-i-built-rumore-nycre/',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://huggingface.co/spaces/pepperumo/MVTec_Website" target="_blank" rel="noopener noreferrer">MVTEC Anomaly Detection</a>,
        titleText: 'MVTEC Anomaly Detection',
        description: 'An anomaly detection system APP, detecting defects on products.',
        image: `${process.env.PUBLIC_URL}/anomaly_visual_example.png`,
        technologies: ['Python', 'PyTorch', 'Computer Vision', 'Convolutional Neural Networks'],
        github: 'https://github.com/pepperumo/MVTEC-anomaly-detection',
        external: 'https://huggingface.co/spaces/pepperumo/MVTec_Website',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://www.linkedin.com/pulse/car-damage-detection-using-ai-giuseppe-rumore-9ld7f/?trackingId=8UVElv3GQwez%2Bi4IDUYQQQ%3D%3D" target="_blank" rel="noopener noreferrer">Automated Vehicle Damage Detection</a>,
        titleText: 'Automated Vehicle Damage Detection',
        description: 'An AI-powered system for automated detection and assessment of vehicle damage using computer vision and machine learning techniques.',
        image: `${process.env.PUBLIC_URL}/car_damage.png`,
        technologies: ['Python', 'Computer Vision', 'Machine Learning', 'Deep Learning', 'Image Processing'],
        github: 'https://github.com/pepperumo/automated_vehicle_damage',
        external: 'https://www.linkedin.com/pulse/car-damage-detection-using-ai-giuseppe-rumore-9ld7f/?trackingId=8UVElv3GQwez%2Bi4IDUYQQQ%3D%3D',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://huggingface.co/spaces/pepperumo/book_recommender_streamlit" target="_blank" rel="noopener noreferrer">AI-Powered Recommendation APP</a>,
        titleText: 'AI-Powered Recommendation APP',
        description: 'A recommendation system using collaborative filtering and deep learning techniques.',
        image: `${process.env.PUBLIC_URL}/books.jpg`,
        technologies: ['Python', 'TensorFlow', 'FastAPI', 'TypeScript', 'Streamlit'],
        github: 'https://github.com/pepperumo/MLOps_book_recommender_system',
        external: 'https://huggingface.co/spaces/pepperumo/book_recommender_streamlit',
        category: 'MLOps',
        featured: false
      },
      {        title: <a href="https://www.linkedin.com/pulse/crypto-foresight-ai-powered-platform-real-time-giuseppe-rumore-e38lf/?trackingId=labKh5L7TbyvzyeYqmp7%2BQ%3D%3D" target="_blank" rel="noopener noreferrer">Crypto Foresight</a>,
        titleText: 'Crypto Foresight',
        description: 'AI-powered price forecasting platform for cryptocurrency using advanced machine learning models.',
        image: `${process.env.PUBLIC_URL}/Forecast.png`,
        technologies: ['Python', 'Machine Learning', 'React.js', 'Time Series Forecasting', 'Data Visualization'],
        github: 'https://github.com/pepperumo/crypto-forecasting',
        external: 'https://www.linkedin.com/pulse/crypto-foresight-ai-powered-platform-real-time-giuseppe-rumore-e38lf/?trackingId=labKh5L7TbyvzyeYqmp7%2BQ%3D%3D',
        category: 'ai',
        featured: true
      },
      {
        title: <a href="https://www.linkedin.com/pulse/optimizing-cad-designs-using-genetic-algorithms-giuseppe-rumore-gpoif/" target="_blank" rel="noopener noreferrer">CAD Design Optimization with Genetic Algorithms</a>,
        titleText: 'CAD Design Optimization with Genetic Algorithms',
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
        titleText: 'ROS2 Bumperbot',
        description: 'A self-driving robot using ROS2, C++, Python and Gazebo. ',
        image: `${process.env.PUBLIC_URL}/bumperbot.png`,
        technologies: ['ROS2', 'C++', 'Python', 'Gazebo'],
        github: 'https://github.com/pepperumo/Differential_self_driving_Robot_bumperbot',
        external: 'https://www.linkedin.com/pulse/self-driving-ros-2-giuseppe-rumore-l6wzf/',
        category: 'robotics',
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
        <TerminalSection title="My Projects" subtitle="A showcase of my technical projects and professional work.">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 0.6, 0.15, 0.85, 1], y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              $featured={project.featured}
            >              <ProjectImageContainer>
                {project.external ? (
                  <a href={project.external} target="_blank" rel="noopener noreferrer">
                    <ProjectImage src={project.image} alt={project.title} />
                  </a>
                ) : (
                  <ProjectImage src={project.image} alt={project.title} />
                )}
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
        </TerminalSection>
      </div>
    </PortfolioSection>
  );
};

const PortfolioSection = styled.section`
  /* Using global section styling from GlobalStyles.js */
  padding-top: 20px !important;
  
  @media (max-width: 1080px) {
    padding-top: 15px !important;
  }
  
  @media (max-width: 768px) {
    padding-top: 10px !important;
  }
  
  @media (max-width: 480px) {
    padding-top: 10px !important;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;
`;

const FilterButton = styled.button`
  background: ${props => (props.$active ? 'rgba(0, 232, 162, 0.1)' : 'var(--droplet-bg)')};
  color: ${props => (props.$active ? 'var(--text-primary)' : 'var(--text-secondary)')};
  border-color: ${props => (props.$active ? 'rgba(0, 232, 162, 0.6)' : undefined)};
  padding: 8px 20px;
  margin: 0 10px 10px 0;
  font-size: 14px;
  letter-spacing: 0.05em;

  &::after {
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  &:hover {
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
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--glass-radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: var(--glass-border);
  box-shadow: var(--glass-shadow);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--glass-card-hover-shadow);
  }
`;

const ProjectImageContainer = styled.div`
  position: relative;
  height: 0;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  
  a {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
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
    content: '>';
    color: var(--secondary-color);
    margin-right: 5px;
  }
`;

const ViewMoreButton = styled.a`
  position: relative;
  overflow: hidden;
  color: var(--secondary-color);
  background: var(--droplet-bg);
  border: var(--droplet-border);
  border-radius: 4px;
  box-shadow: var(--droplet-shadow);
  padding: 15px 34px;
  font-size: 14px;
  font-family: var(--font-mono);
  text-decoration: none;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 50px auto 0;
  display: block;
  width: fit-content;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 232, 162, 0.1);
    border-color: rgba(0, 232, 162, 0.6);
    box-shadow: 0 0 8px rgba(0, 232, 162, 0.2);
    transform: translateY(-2px);
  }
`;

export default Portfolio;
