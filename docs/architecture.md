# PeppeGPT Full-Stack Architecture

Date: 2025-09-13
Owner: Winston (Architect)  
Status: Implementation Ready
Version: 2.0

## 1. Executive Summary

PeppeGPT is a hybrid architecture solution that integrates an AI-powered chat widget into an existing React portfolio website. The system leverages Hugging Face Spaces for zero-cost AI processing while maintaining GitHub Pages hosting for the frontend, ensuring complete operational cost-free deployment.

### Key Architectural Decisions

- **Brownfield Integration**: Safe enhancement of existing React portfolio without breaking changes
- **Hybrid Deployment**: Frontend on GitHub Pages + Backend on Hugging Face Spaces
- **Feature Flag Architecture**: Safe rollback capabilities for production stability
- **Zero-Cost Constraint**: All components operate within free-tier limits
- **Performance-First**: Lazy loading and bundle size optimization

## 2. System Context & Constraints

### Business Context
- **Primary Users**: Technical recruiters seeking candidate information
- **Success Metrics**: 80% accuracy, <5s response time, zero operational cost
- **Risk Profile**: Low-risk brownfield enhancement with rollback capabilities

### Technical Constraints
- **Cost**: Must operate entirely on free tiers (GitHub Pages + Hugging Face)
- **Performance**: <50KB bundle impact, lazy loading required
- **Compatibility**: React CRA, styled-components, existing portfolio structure
- **Security**: No PII storage, ephemeral sessions only

### Operational Constraints
- **Deployment**: Automated via GitHub Actions
- **Monitoring**: Free-tier observability solutions only
- **Maintenance**: Minimal manual intervention required

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PeppeGPT System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐│
│  │   Frontend      │    │           Backend                    ││
│  │  (GitHub Pages) │    │      (Hugging Face Spaces)          ││
│  │                 │    │                                      ││
│  │ ┌─────────────┐ │    │ ┌──────────────┐ ┌──────────────┐   ││
│  │ │Chat Widget  │◄┼────┼►│   API Layer  │ │ AI Processing│   ││
│  │ │(React Lazy) │ │    │ │   (FastAPI)  │ │   (HF Models)│   ││
│  │ └─────────────┘ │    │ └──────────────┘ └──────────────┘   ││
│  │                 │    │                                      ││
│  │ ┌─────────────┐ │    │ ┌──────────────┐ ┌──────────────┐   ││
│  │ │Portfolio    │ │    │ │Content Sync  │ │Vector Store  │   ││
│  │ │(Existing)   │ │    │ │   Pipeline   │ │ (In-Memory)  │   ││
│  │ └─────────────┘ │    │ └──────────────┘ └──────────────┘   ││
│  └─────────────────┘    └──────────────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                        │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐│
│  │  GitHub Actions │    │        Environment Config            ││
│  │   CI/CD Pipeline│    │     (Feature Flags & Secrets)       ││
│  └─────────────────┘    └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 4. Component Architecture

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

## 5. Data Architecture

### 5.1 Frontend State Management
```javascript
// Chat State Schema
{
  isOpen: boolean,
  isLoading: boolean,
  error: Error | null,
  messages: Array<{
    id: string,
    role: 'user' | 'assistant',
    content: string,
    timestamp: string,
    confidence?: number,
    sources?: Array<Source>
  }>,
  sessionId: string,      // UUID v4, ephemeral
  suggestions: Array<{
    category: string,
    questions: Array<string>
  }>
}
```

### 5.2 Backend Data Models
```python
# API Request/Response Models
class ChatRequest(BaseModel):
    sessionId: str
    message: str
    history: List[Message]
    topK: int = 4
    maxTokens: int = 256

class ChatResponse(BaseModel):
    text: str
    sources: List[Source]
    usage: Usage
    confidence: float

class Source(BaseModel):
    id: str
    type: Literal["skills", "experience", "projects", "education"]
    title: str
    confidence: float

class Usage(BaseModel):
    latencyMs: int
    model: str
    cached: bool
```

### 5.3 Content Structure
```python
# Portfolio Content Schema
{
  "skills": [
    {
      "id": "skill_001",
      "category": "programming",
      "name": "Python",
      "proficiency": "Expert",
      "experience_years": 5,
      "context": "Used in data science projects..."
    }
  ],
  "experience": [
    {
      "id": "exp_001",
      "company": "TechCorp",
      "position": "Data Scientist",
      "duration": "2021-2023",
      "description": "Led ML initiatives...",
      "technologies": ["Python", "TensorFlow", "AWS"]
    }
  ],
  "projects": [...],
  "education": [...]
}
```

## 6. Security Architecture

### 6.1 Data Protection
- **No PII Storage**: Ephemeral session IDs only
- **Input Sanitization**: Client-side validation (800 char limit)
- **Output Sanitization**: Plain text responses (no markdown rendering)
- **CORS Configuration**: Restrict to GitHub Pages domain

### 6.2 API Security
```python
# Rate Limiting Strategy
RATE_LIMITS = {
    "per_session": "10 requests/minute",
    "per_ip": "50 requests/hour", 
    "global": "1000 requests/day"  # Free tier compliance
}

# Request Validation
- Message length: ≤ 800 characters
- Session ID: Valid UUID v4 format
- History: ≤ 6 conversation turns
```

### 6.3 Environment Security
- **API Keys**: Stored in HF Spaces secrets
- **Environment Variables**: Separate dev/prod configurations
- **Feature Flags**: Runtime toggle for emergency shutoff

## 7. Performance Architecture

### 7.1 Frontend Performance
```javascript
// Bundle Size Targets
const PERFORMANCE_BUDGETS = {
  initial: "50KB gzipped",     // ChatLauncher only
  lazy: "100KB gzipped",       // Full chat interface
  total: "150KB gzipped"       // Maximum impact
};

// Loading Strategy
const ChatWidget = React.lazy(() => 
  import('./features/chat').then(module => ({
    default: module.Chat
  }))
);
```

### 7.2 Backend Performance
```python
# Response Time Targets
PERFORMANCE_TARGETS = {
    "embedding_generation": "< 1s",
    "semantic_search": "< 0.5s", 
    "llm_response": "< 3s",
    "total_response": "< 5s"
}

# Memory Optimization
- Embedding cache: In-memory with LRU eviction
- Model loading: Lazy initialization
- Batch processing: Multiple queries when possible
```

### 7.3 Caching Strategy
```python
# Multi-Level Caching
class CacheStrategy:
    embedding_cache = TTLCache(maxsize=1000, ttl=3600)     # 1 hour
    response_cache = TTLCache(maxsize=500, ttl=1800)       # 30 minutes
    content_cache = TTLCache(maxsize=1, ttl=86400)         # 24 hours
```

## 8. Integration Architecture

### 8.1 Content Synchronization Pipeline
```yaml
# GitHub Actions Workflow
name: Content Sync Pipeline
triggers:
  - push: [main]
  - schedule: "0 2 * * *"  # Daily at 2 AM

jobs:
  extract_content:
    - Parse React components
    - Extract text content
    - Structure for AI processing
    - Validate completeness
  
  update_embeddings:
    - Generate new embeddings
    - Update HF Spaces content
    - Validate sync completion
    - Monitor performance impact
```

### 8.2 Deployment Architecture
```yaml
# Dual Deployment Strategy
deployments:
  frontend:
    platform: GitHub Pages
    trigger: main branch push
    build: npm run build
    deploy: gh-pages branch
    
  backend:
    platform: Hugging Face Spaces
    trigger: backend/ changes
    runtime: python 3.11
    dependencies: requirements.txt
```

### 8.3 Feature Flag Implementation
```javascript
// Frontend Feature Flag
const useFeatureFlag = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    const enabled = process.env.REACT_APP_PEPPEGPT_ENABLED === 'true';
    setIsEnabled(enabled);
  }, []);
  
  return isEnabled;
};

// Usage in App.js
function App() {
  const isChatEnabled = useFeatureFlag();
  
  return (
    <AppContainer>
      {/* Existing portfolio components */}
      {isChatEnabled && (
        <Suspense fallback={<div>Loading chat...</div>}>
          <ChatLauncher />
        </Suspense>
      )}
    </AppContainer>
  );
}
```

## 9. Error Handling & Resilience

### 9.1 Frontend Error Handling
```javascript
// Error Boundary Strategy
class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error without PII
    console.error('Chat widget error:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return <ChatUnavailableMessage />;
    }
    return this.props.children;
  }
}
```

### 9.2 API Resilience
```python
# Circuit Breaker Pattern
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
            else:
                raise CircuitBreakerOpenError()
        
        try:
            result = func(*args, **kwargs)
            self.reset()
            return result
        except Exception as e:
            self.record_failure()
            raise e
```

### 9.3 Graceful Degradation
```javascript
// Fallback Responses
const FALLBACK_RESPONSES = {
  rate_limit: "I'm currently experiencing high traffic. Please try again in a few moments, or explore the portfolio sections directly.",
  network_error: "I'm having trouble connecting right now. You can find information about skills, experience, and projects in the portfolio sections above.",
  api_error: "I'm temporarily unavailable. Please browse the portfolio directly or contact via the contact section."
};
```

## 10. Monitoring & Observability

### 10.1 Performance Monitoring
```javascript
// Frontend Performance Tracking
class PerformanceMonitor {
  trackBundleSize() {
    // Monitor chunk sizes
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chat')) {
          console.log(`Chat bundle size: ${entry.transferSize} bytes`);
        }
      }
    });
    observer.observe({entryTypes: ['resource']});
  }
  
  trackResponseTime(endpoint, duration) {
    // Track API response times
    if (duration > 5000) {
      console.warn(`Slow response: ${endpoint} took ${duration}ms`);
    }
  }
}
```

### 10.2 Usage Analytics (Privacy-Compliant)
```python
# Anonymous Usage Tracking
class AnalyticsService:
    def track_query(self, query_type: str, confidence: float):
        # No PII, aggregated metrics only
        metrics = {
            "timestamp": datetime.utcnow(),
            "query_type": query_type,  # skills, experience, projects
            "confidence": confidence,
            "response_time": self.last_response_time
        }
        self.log_metrics(metrics)
    
    def generate_daily_report(self):
        return {
            "total_queries": self.query_count,
            "avg_confidence": self.avg_confidence,
            "query_distribution": self.query_types,
            "performance_metrics": self.response_times
        }
```

## 11. Deployment Strategy

### 11.1 Release Process
```yaml
# Multi-Stage Deployment
stages:
  1_infrastructure:
    - Set up HF Spaces
    - Configure environment variables
    - Test health endpoints
    
  2_backend_deployment:
    - Deploy AI processing backend
    - Validate model loading
    - Test API endpoints
    
  3_frontend_integration:
    - Enable feature flag (dev)
    - Deploy frontend changes
    - Test end-to-end flow
    
  4_production_release:
    - Enable feature flag (prod)
    - Monitor performance
    - Validate user experience
```

### 11.2 Rollback Procedures
```bash
# Emergency Rollback Script
#!/bin/bash
echo "Initiating PeppeGPT rollback..."

# 1. Disable feature flag
export REACT_APP_PEPPEGPT_ENABLED=false

# 2. Redeploy frontend without chat widget
npm run build
npm run deploy

# 3. Verify portfolio functionality
curl -f https://pepperumo.github.io/personal_porfolio_website/ || exit 1

echo "Rollback completed successfully"
```

### 11.3 Health Checks
```python
# System Health Monitoring
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "embedding_model": await check_embedding_model(),
            "llm_model": await check_llm_model(),
            "content_cache": check_content_cache(),
            "rate_limiter": check_rate_limiter()
        },
        "performance": {
            "avg_response_time": get_avg_response_time(),
            "cache_hit_rate": get_cache_hit_rate(),
            "error_rate": get_error_rate()
        }
    }
    return health_status
```

## 12. Testing Strategy

### 12.1 Frontend Testing
```javascript
// Component Testing
describe('ChatWidget', () => {
  test('lazy loads without impacting portfolio', async () => {
    render(<App />);
    
    // Verify portfolio loads normally
    expect(screen.getByText('About')).toBeInTheDocument();
    
    // Verify chat launcher exists but chat panel doesn't
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  test('handles API errors gracefully', async () => {
    mockFetch.mockRejectOnce(new Error('Network error'));
    
    const { getByRole } = render(<ChatWidget />);
    fireEvent.click(getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
    });
  });
});
```

### 12.2 Backend Testing
```python
# API Testing
class TestChatAPI:
    def test_chat_endpoint_success(self):
        request = ChatRequest(
            sessionId="test-session",
            message="What skills do you have?",
            history=[]
        )
        
        response = client.post("/api/chat", json=request.dict())
        assert response.status_code == 200
        
        data = response.json()
        assert "text" in data
        assert "sources" in data
        assert data["confidence"] > 0.5
    
    def test_rate_limiting(self):
        # Test rate limit enforcement
        for i in range(15):  # Exceed 10/minute limit
            response = client.post("/api/chat", json=valid_request)
            
        assert response.status_code == 429
        assert "rate_limit" in response.json()["code"]
```

### 12.3 Integration Testing
```yaml
# End-to-End Testing
test_scenarios:
  - name: "Complete user journey"
    steps:
      - Visit portfolio website
      - Click chat launcher
      - Send skills question
      - Verify relevant response
      - Test suggested questions
      - Verify performance impact
  
  - name: "Error handling scenarios"
    steps:
      - Simulate backend unavailable
      - Verify graceful degradation
      - Test recovery after backend returns
      - Verify portfolio still functional
```

## 13. Architecture Decision Records (ADRs)

### ADR-001: Hugging Face Spaces for Backend
**Decision**: Use Hugging Face Spaces instead of traditional cloud providers
**Rationale**: Zero cost, integrated AI model hosting, simple deployment
**Consequences**: Limited to HF's infrastructure, free-tier constraints

### ADR-002: Lazy Loading for Chat Widget
**Decision**: Implement React.lazy for chat components
**Rationale**: Minimize impact on portfolio loading performance
**Consequences**: Slight delay when first opening chat, complexity in error handling

### ADR-003: Ephemeral Sessions Only
**Decision**: No conversation persistence across browser sessions
**Rationale**: Privacy compliance, reduced backend complexity, aligns with recruiter use case
**Consequences**: Users lose context on page refresh, simpler architecture

### ADR-004: Feature Flag Architecture
**Decision**: Environment variable-based feature toggling
**Rationale**: Safe rollback capability for brownfield deployment
**Consequences**: Additional configuration complexity, enables gradual rollout

## 14. Migration & Deployment Plan

### Phase 1: Infrastructure Setup (Epic 0)
- **Duration**: 3-5 days
- **Deliverables**: HF Spaces backend, CI/CD pipelines, feature flags
- **Risk Mitigation**: Rollback procedures tested before production

### Phase 2: Core Integration (Epic 1)
- **Duration**: 5-7 days
- **Deliverables**: Chat widget, content extraction, API connectivity
- **Risk Mitigation**: Performance monitoring, regression testing

### Phase 3: AI Processing (Epic 2)
- **Duration**: 7-10 days
- **Deliverables**: Semantic search, AI responses, content sync
- **Risk Mitigation**: Quality validation, accuracy testing

### Phase 4: Polish & Launch (Epic 3)
- **Duration**: 3-5 days
- **Deliverables**: UX enhancements, analytics, final optimization
- **Risk Mitigation**: User acceptance testing, performance validation

### Total Timeline: 18-27 days

## 15. Conclusion

This architecture provides a robust, scalable, and cost-effective solution for integrating AI chat capabilities into the existing portfolio website. The design prioritizes safety through feature flags and rollback procedures, maintains performance through lazy loading and bundle optimization, and ensures zero operational costs through strategic use of free-tier services.

The modular design enables incremental delivery while maintaining system integrity, and the comprehensive error handling ensures graceful degradation under various failure scenarios. The architecture is designed to evolve with changing requirements while maintaining the core constraint of zero operational costs.

**Ready for Implementation**: This architecture provides the technical foundation for the development team to begin Epic 0 implementation immediately.