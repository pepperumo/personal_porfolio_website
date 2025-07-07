import React from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from './components/Navigation/Navbar';
import AboutMe from './components/Home/Home';
import Experience from './components/Experience/Experience';
import Education from './components/Education/Education';
import Portfolio from './components/Portfolio/Portfolio';
import Languages from './components/Languages/Languages';
import Skills from './components/Skills/Skills';
import Contact from './components/Contact/Contact';
import SocialSidebar from './components/SocialSidebar/SocialSidebar';
import ThreeBackground from './components/ThreeBackground/ThreeBackground';

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <ThreeBackground />
      <Navbar />
      <SocialSidebar />
      <AboutMe />
      <Portfolio />
      <Languages />
      <Skills />
      <Experience />
      <Education />
      <Contact />
    </AppContainer>
  );
}

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export default App;
