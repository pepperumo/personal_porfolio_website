# Epic 1: Foundation & Core Integration

Implement CV PDF extraction pipeline, basic chat widget component, and frontend-backend connectivity with the existing portfolio, ensuring safe brownfield integration.

### Story 1.1: Extract CV Content from PDF for AI Knowledge Base

As a system,
I want to automatically extract and structure content from the CV PDF file,
so that the AI has current information about skills, experience, and projects to answer questions.

#### Acceptance Criteria

1. Automated script extracts text content from CV PDF file stored in repository
2. Content is structured into categories (skills, experience, projects, education, contact)
3. PDF extraction runs without affecting existing portfolio functionality
4. Extracted content is formatted for embedding generation
5. Process can be triggered manually and via automated pipeline when PDF changes
6. Content validation ensures completeness and handles PDF formatting variations

### Story 1.2: Implement Basic Chat Widget Component

As a portfolio visitor,
I want to see a chat interface on the portfolio website,
so that I can interact with the AI assistant to ask questions.

#### Acceptance Criteria

1. React chat widget component renders on portfolio pages using lazy loading
2. Widget has expandable/collapsible functionality with floating button design
3. Basic text input and message display functionality works
4. Widget styling integrates with existing styled-components architecture
5. Widget positioning doesn't interfere with portfolio navigation or content
6. Widget is responsive across desktop and mobile devices
7. Performance budget maintained (<50KB initial, <100KB when opened)

### Story 1.3: Connect Frontend to Backend with Error Handling

As a user,
I want my chat messages to be processed by the AI system with proper error handling,
so that I can receive intelligent responses or appropriate fallback messages.

#### Acceptance Criteria

1. Chat widget successfully sends messages to Hugging Face Spaces API
2. API responses are displayed in the chat interface with proper formatting
3. Comprehensive error handling for network failures, timeouts, and rate limits
4. Loading states indicate when processing is in progress
5. Rate limiting gracefully handled with user-friendly messages
6. Retry logic implemented with exponential backoff
7. Circuit breaker prevents overwhelming the backend when issues occur

### Story 1.4: Validate Integration and Performance Impact

As a portfolio owner,
I want to ensure the chat widget doesn't negatively impact my existing portfolio,
so that the enhancement provides value without compromising the user experience.

#### Acceptance Criteria

1. Existing portfolio functionality verified through regression testing
2. Page load performance impact measured and within acceptable limits
3. Bundle size increase documented and justified
4. Mobile performance validated across different devices
5. Accessibility compliance verified for widget integration
6. Error scenarios tested to ensure graceful degradation

