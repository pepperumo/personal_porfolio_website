# Technical Assumptions

### Repository Structure: Monorepo

The PeppeGPT functionality will be integrated into the existing portfolio repository structure, adding AI chat capabilities without requiring separate repository management.

### Service Architecture

**Hybrid Architecture**: Frontend React component integrated with portfolio + Serverless backend via Hugging Face Spaces. The chat widget operates as a client-side component that communicates with Hugging Face's API infrastructure for AI processing, maintaining the zero-cost requirement.

### Testing Requirements

**Unit + Integration Testing**: Implement unit tests for React components and integration tests for the AI service communication. Manual testing for user experience validation and accuracy of AI responses to ensure the 80% accuracy requirement is met.

### Additional Technical Assumptions and Requests

- **Hugging Face Models**: Utilize sentence-transformers for embedding generation and a lightweight conversational AI model for response generation
- **Content Sync**: Implement automated content extraction from portfolio HTML/React components to keep AI knowledge current
- **State Management**: Simple local state management for chat history without persistence (aligns with no conversation memory requirement)
- **API Rate Limits**: Design with Hugging Face free-tier rate limits in mind, implementing graceful degradation if limits are exceeded
- **Deployment**: Leverage GitHub Actions for automated deployment to both GitHub Pages (frontend) and Hugging Face Spaces (backend processing)
