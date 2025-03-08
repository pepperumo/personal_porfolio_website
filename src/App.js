import React from 'react';
import styled from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from './components/Navigation/Navbar';
import AboutMe from './components/Home/Home';
import Portfolio from './components/Portfolio/Portfolio';
import Contact from './components/Contact/Contact';

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <Navbar />
      <AboutMe />
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
