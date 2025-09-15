import React, { Suspense } from 'react';
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

// Chat Feature
import { ErrorBoundary, ChatProvider, useChat } from './features/chat';

// Lazy load chat components for performance
const ChatLauncher = React.lazy(() => 
  import('./features/chat').then(module => ({
    default: module.ChatLauncher
  }))
);

const ChatPanel = React.lazy(() => 
  import('./features/chat').then(module => ({
    default: module.ChatPanel
  }))
);

// Chat panel component that renders when chat is open
const ChatDisplay = () => {
  const { isChatOpen, closeChat } = useChat();

  if (!isChatOpen) return null;

  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPanel onClose={closeChat} />
    </Suspense>
  );
};

function App() {
  // Feature flag for chat widget (can be controlled via env var later)
  const isChatEnabled = process.env.REACT_APP_CHAT_ENABLED !== 'false';

  return (
    <ChatProvider>
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
        
        {/* Conditionally render chat widget */}
        {isChatEnabled && (
          <ErrorBoundary fallback={<div />}>
            {/* Corner chat launcher button only */}
            <Suspense fallback={<div>Loading chat...</div>}>
              <ChatLauncher />
            </Suspense>
            
            {/* Shared chat panel */}
            <ChatDisplay />
          </ErrorBoundary>
        )}
      </AppContainer>
    </ChatProvider>
  );
}

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export default App;
