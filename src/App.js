import React from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from './components/Navigation/Navbar';
import AboutMe from './components/Home/Home';
import Experience from './components/Experience/Experience';
import Education from './components/Education/Education';
import Portfolio from './components/Portfolio/Portfolio';
import Contact from './components/Contact/Contact';
import SocialSidebar from './components/SocialSidebar/SocialSidebar';

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <Navbar />
      <SocialSidebar />
      <AboutMe />
      <Experience />
      <Education />
      <Portfolio />
      <Contact />
    </AppContainer>
  );
}

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export default App;
