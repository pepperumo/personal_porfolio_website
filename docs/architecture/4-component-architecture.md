# 4. Component Architecture

### 4.1 Frontend Architecture (GitHub Pages)

#### Core Components
```
src/
├── features/chat/           # PeppeGPT Feature Module
│   ├── components/
│   │   ├── ChatLauncher.js     # Floating button (always loaded)
│   │   ├── ChatPanel.js        # Main chat interface (lazy)
│   │   ├── MessageList.js      # Conversation display
│   │   ├── Composer.js         # Input & send functionality
│   │   ├── SuggestionsBar.js   # Recruiter question prompts
│   │   └── StatusBar.js        # Loading/error states
│   ├── hooks/
│   │   ├── useChat.js          # State management & API calls
│   │   ├── useFeatureFlag.js   # Feature toggle logic
│   │   └── useAnalytics.js     # Privacy-compliant tracking
│   ├── services/
│   │   ├── chatService.js      # API client with retry logic
│   │   ├── configService.js    # Environment configuration
│   │   └── performanceService.js # Bundle monitoring
│   └── index.js             # Lazy import entry point
```

#### Integration Points
- **App.js**: Conditional ChatLauncher rendering based on feature flag
- **Styled-Components**: Reuse existing theme and component library
- **Bundle Splitting**: Dynamic imports for chat functionality
- **Performance Monitoring**: Real-time bundle size tracking

### 4.2 Backend Architecture (Hugging Face Spaces)

#### Service Layer
```
backend/
├── app.py                   # FastAPI application entry
├── api/
│   ├── __init__.py
│   ├── chat.py             # Chat endpoint implementation
│   ├── health.py           # System health checks
│   └── middleware.py       # CORS, rate limiting, logging
├── services/
│   ├── __init__.py
│   ├── embedding_service.py    # Sentence transformer operations
│   ├── llm_service.py         # Conversational AI integration
│   ├── search_service.py      # Semantic similarity search
│   └── content_service.py     # Portfolio content management
├── models/
│   ├── __init__.py
│   ├── chat_models.py      # Request/response schemas
│   └── content_models.py   # Portfolio content structures
├── utils/
│   ├── __init__.py
│   ├── rate_limiter.py     # Free-tier compliance
│   ├── error_handler.py    # Standardized error responses
│   └── performance.py      # Latency and usage tracking
└── requirements.txt        # Dependency management
```

#### AI Processing Pipeline
```
User Question → Embedding Generation → Semantic Search → 
Context Retrieval → LLM Processing → Response Generation → 
Quality Validation → Client Response
```
