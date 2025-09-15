# PeppeGPT Frontend Architecture (Chat Widget)

Date: 2025-09-13
Owner: Winston (Architect)
Status: Implementation Ready
Version: 2.0 - Updated for Full-Stack Integration

**Note**: This document provides detailed frontend implementation guidance and is part of the comprehensive full-stack architecture defined in `docs/architecture.md`.

## 1. Objectives & Constraints

- Add an AI chat widget to the existing React (CRA) portfolio without breaking current UX.
- Zero infra cost: run entirely on GitHub Pages + call a Hugging Face Spaces backend.
- Free-tier friendly: request/size limits respected, graceful degradation when rate-limited.
- Performance: initial load unaffected (<50KB added to main bundle, lazy-load heavy deps).
- Accessibility: WCAG AA, keyboard navigation, screen reader roles/labels.
- Mobile-first, responsive behavior.
- **NEW**: Feature flag architecture for safe brownfield integration.
- **NEW**: Comprehensive error handling and rollback capabilities.

## 2. High-Level Design

The chat widget is an isolated React feature with three layers:

- **UI Layer**: Widget shell, message list, input, suggestions.
- **Service Layer**: API client to Hugging Face Space, rate-limit/timeout handling, retry/backoff, circuit breaker.
- **State Layer**: Local state only (no persistence), ephemeral session ID, feature flag management.

Integration points:
- Inject widget into `App.js` below `Navbar`/above `SocialSidebar` or as floating button.
- Load widget code via dynamic import to avoid impacting TTI of main site.
- **NEW**: Feature flag controls entire widget visibility.
- **NEW**: Performance monitoring for portfolio impact assessment.

## 3. Component Diagram

```
ChatErrorBoundary
├── FeatureFlagWrapper
    ├── ChatLauncher (floating button) - Always loaded
    │   └── toggles -> ChatPanel (Lazy loaded)
    └── ChatPanel (portal/modal or anchored panel)
        ├── MessageList
        ├── Composer (input + send)
        ├── SuggestionsBar (skills/experience/projects)
        └── StatusBar (typing/loading/errors)

Cross-cutting Services:
├── useChat() hook: orchestrates state, calls ChatService
├── useFeatureFlag() hook: runtime feature toggle
├── ChatService: fetch wrapper with abort, retries, circuit-breaker
├── PerformanceMonitor: bundle size and response time tracking
└── Analytics hook (optional, privacy-compliant)
```

## 4. Data Contracts (Frontend <-> Backend)

### Request POST /api/chat

```json
{
  "headers": { "Content-Type": "application/json" },
  "body": {
    "sessionId": "string", // uuid v4 (ephemeral)
    "message": "string",
    "history": [
      { "role": "user|assistant", "content": "string" }
    ], // trimmed to last 6 turns
    "topK": 4, // default
    "maxTokens": 256 // default
  }
}
```

### Response 200

```json
{
  "text": "string",
  "sources": [
    {
      "id": "string",
      "type": "skills|experience|projects|education",
      "title": "string",
      "confidence": "number"
    }
  ],
  "usage": {
    "latencyMs": "number",
    "model": "string",
    "cached": "boolean"
  },
  "confidence": "number"
}
```

### Error Responses

- **429**: `{ "code": "RATE_LIMIT", "retryAfter": number, "message": "string" }`
- **5xx/timeout**: `{ "code": "UPSTREAM_ERROR", "message": "string" }`
- **400**: `{ "code": "BAD_REQUEST", "message": "string" }`

## 5. State & Interaction Model

```javascript
// Enhanced Chat State
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
  }>,
  // NEW: Feature flag and performance tracking
  isFeatureEnabled: boolean,
  performanceMetrics: {
    bundleSize: number,
    lastResponseTime: number,
    errorCount: number
  }
}
```

### Interaction Flow

1. **Feature Flag Check**: Verify widget should be displayed
2. **Lazy Component Load**: Dynamic import when user interacts
3. **History Trimming**: Keep last 6 turns to stay within free-tier limits
4. **Request Management**: Cancel in-flight requests via AbortController
5. **Error Handling**: Circuit breaker prevents backend overload
6. **Performance Monitoring**: Track bundle impact and response times

## 6. Performance Plan

- **Code-split widget**: `const Chat = React.lazy(() => import('./chat/Chat'))`
- **Defer import** until user interacts with launcher
- **Reuse existing libs**: styled-components, React hooks
- **Minimal DOM updates**: efficient re-rendering strategies
- **Budget enforcement**: +<50KB gzip initial, +<100KB when widget opens
- **Performance monitoring**: Real-time bundle size tracking
- **Automated testing**: Performance regression tests in CI/CD

### Performance Monitoring Implementation

```javascript
class PerformanceMonitor {
  static trackBundleSize() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chat')) {
          console.log(`Chat bundle: ${entry.transferSize}B`);
          if (entry.transferSize > 102400) { // 100KB limit
            console.warn('Chat bundle exceeds size limit');
          }
        }
      }
    });
    observer.observe({entryTypes: ['resource']});
  }
}
```

## 7. Accessibility

- **Launcher**: `button` with `aria-label="Open chat with PeppeGPT"`
- **Panel**: `role="dialog" aria-modal="true"` focus trap, ESC closes
- **Message list**: `aria-live="polite"` for assistant replies
- **Input**: proper label association, enter to send, shift+enter newline
- **Error states**: `aria-describedby` for error announcements
- **Loading states**: `aria-busy` during processing

## 8. Error Handling & Empty States

### Error Categories & Responses

```javascript
const ERROR_HANDLERS = {
  NETWORK_ERROR: {
    message: "I'm having trouble connecting. You can browse the portfolio directly.",
    action: "retry",
    fallback: "portfolio_navigation"
  },
  RATE_LIMIT: {
    message: "I'm busy right now. Try these suggested questions or explore the portfolio.",
    action: "show_suggestions",
    cooldown: true
  },
  BACKEND_DOWN: {
    message: "I'm temporarily unavailable. Please use the portfolio sections above.",
    action: "disable_widget",
    fallback: "portfolio_focus"
  },
  CIRCUIT_BREAKER_OPEN: {
    message: "I need a moment to recover. Please try again shortly.",
    action: "disable_input",
    recovery: "automatic"
  }
};
```

### User Experience States

- **Loading**: Skeleton bubble with typing indicator
- **Empty state**: Suggested questions and conversation starters
- **Error state**: User-friendly messages with actionable CTAs
- **Offline state**: Graceful degradation with portfolio focus

## 9. Security & Privacy

- **No PII storage**: Ephemeral sessionId only, no conversation persistence
- **Input sanitization**: Client-side validation (message <= 800 chars)
- **Output sanitization**: Plain text responses (no markdown rendering)
- **XSS prevention**: Proper React rendering, no dangerouslySetInnerHTML
- **CORS compliance**: Restricted to GitHub Pages domain
- **Privacy-compliant analytics**: No user identification, aggregated metrics only

## 10. Configuration & Feature Flags

### Environment Variables

```javascript
// Build-time configuration (CRA)
const CONFIG = {
  API_ENDPOINT: process.env.REACT_APP_PEPPEGPT_API || '',
  FEATURE_ENABLED: process.env.REACT_APP_PEPPEGPT_ENABLED === 'true',
  DEBUG_MODE: process.env.NODE_ENV === 'development'
};

// Runtime feature flag hook
const useFeatureFlag = () => {
  const [isEnabled, setIsEnabled] = useState(CONFIG.FEATURE_ENABLED);
  
  useEffect(() => {
    // Allow runtime override for emergency disable
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('disable_chat') === 'true') {
      setIsEnabled(false);
    }
  }, []);
  
  return isEnabled;
};
```

### Safe Fallback Implementation

```javascript
// NOOP responder when backend unavailable
const NoOpChatService = {
  async sendMessage() {
    return {
      text: "I'm currently unavailable. Please explore the portfolio sections for information about skills, experience, and projects.",
      sources: [],
      confidence: 0,
      usage: { latencyMs: 0, model: "fallback", cached: true }
    };
  }
};
```

## 11. File/Folder Structure (Implementation)

```
src/
├── features/chat/                    # PeppeGPT Feature Module
│   ├── components/
│   │   ├── ChatLauncher.js          # Floating button (always loaded)
│   │   ├── ChatPanel.js             # Main interface (lazy loaded)
│   │   ├── MessageList.js           # Conversation display
│   │   ├── Composer.js              # Input & send functionality
│   │   ├── SuggestionsBar.js        # Recruiter prompts
│   │   ├── StatusBar.js             # Loading/error states
│   │   └── ErrorBoundary.js         # Error isolation
│   ├── hooks/
│   │   ├── useChat.js               # State management & API calls
│   │   ├── useFeatureFlag.js        # Feature toggle logic
│   │   ├── usePerformanceMonitor.js # Bundle & response tracking
│   │   └── useAnalytics.js          # Privacy-compliant metrics
│   ├── services/
│   │   ├── chatService.js           # API client with circuit breaker
│   │   ├── configService.js         # Environment configuration
│   │   ├── performanceService.js    # Bundle monitoring
│   │   └── fallbackService.js       # NOOP responder
│   ├── utils/
│   │   ├── errorTypes.js            # Error classification
│   │   ├── constants.js             # Configuration constants
│   │   └── helpers.js               # Utility functions
│   └── index.js                     # Lazy import entry point
```

### Integration Changes

```javascript
// src/App.js - Safe Integration Pattern
import React, { Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useFeatureFlag } from './features/chat/hooks/useFeatureFlag';

const ChatLauncher = React.lazy(() => 
  import('./features/chat').then(module => ({
    default: module.ChatLauncher
  }))
);

function App() {
  const isChatEnabled = useFeatureFlag();
  
  return (
    <AppContainer>
      <GlobalStyles />
      <ThreeBackground />
      <Navbar />
      <SocialSidebar />
      
      {/* Existing portfolio components */}
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
          <Suspense fallback={<div>Loading chat...</div>}>
            <ChatLauncher />
          </Suspense>
        </ErrorBoundary>
      )}
    </AppContainer>
  );
}
```

## 12. API Client Details (Enhanced ChatService)

```javascript
class ChatService {
  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      threshold: 5,
      timeout: 60000,
      resetTimeout: 300000
    });
    this.abortController = null;
  }
  
  async sendMessage(request) {
    // Abort previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    
    try {
      return await this.circuitBreaker.call(
        this._makeRequest.bind(this),
        request,
        this.abortController.signal
      );
    } catch (error) {
      return this._handleError(error);
    }
  }
  
  async _makeRequest(request, signal) {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
      timeout: 8000
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    return response.json();
  }
  
  _handleError(error) {
    if (error.name === 'AbortError') {
      return null; // User cancelled
    }
    
    if (error instanceof APIError) {
      switch (error.status) {
        case 429:
          return this._rateLimitResponse(error);
        case 503:
          return this._serviceUnavailableResponse();
        default:
          return this._genericErrorResponse();
      }
    }
    
    return this._networkErrorResponse();
  }
}
```

## 13. Testing Strategy

### Component Testing

```javascript
// ChatWidget.test.js
describe('ChatWidget Integration', () => {
  test('lazy loads without impacting portfolio performance', async () => {
    const performanceStart = performance.now();
    render(<App />);
    
    // Verify portfolio loads quickly
    expect(screen.getByText('About')).toBeInTheDocument();
    
    const loadTime = performance.now() - performanceStart;
    expect(loadTime).toBeLessThan(1000); // 1s budget
  });
  
  test('respects feature flag configuration', () => {
    process.env.REACT_APP_PEPPEGPT_ENABLED = 'false';
    render(<App />);
    
    expect(screen.queryByLabelText('Open chat')).not.toBeInTheDocument();
  });
  
  test('handles API errors gracefully', async () => {
    mockFetch.mockRejectOnce(new Error('Network error'));
    
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText('Open chat'));
    
    await waitFor(() => {
      expect(screen.getByText(/having trouble connecting/i)).toBeInTheDocument();
    });
  });
});
```

### Performance Testing

```javascript
// Performance regression tests
describe('Performance Monitoring', () => {
  test('chat bundle stays within size limits', () => {
    const bundleStats = getBundleStats();
    const chatChunk = bundleStats.chunks.find(c => c.name.includes('chat'));
    
    expect(chatChunk.size).toBeLessThan(102400); // 100KB limit
  });
  
  test('lazy loading prevents initial bundle bloat', () => {
    const initialBundle = getInitialBundleSize();
    const chatLauncherSize = getChatLauncherSize();
    
    expect(chatLauncherSize).toBeLessThan(51200); // 50KB limit
  });
});
```

## 14. Deployment & Operations

### Rollback Procedure

```bash
#!/bin/bash
# Emergency Rollback Script
echo "Initiating PeppeGPT rollback..."

# 1. Disable feature flag
export REACT_APP_PEPPEGPT_ENABLED=false

# 2. Trigger rebuild and deployment
npm run build
npm run deploy

# 3. Verify portfolio functionality
echo "Validating portfolio functionality..."
curl -f https://pepperumo.github.io/personal_porfolio_website/ || {
  echo "Portfolio validation failed!"
  exit 1
}

# 4. Clear CDN cache if applicable
echo "Clearing cache..."
# Implementation depends on hosting setup

echo "Rollback completed successfully"
```

### Health Monitoring

```javascript
// Frontend health checks
class HealthMonitor {
  static async checkChatHealth() {
    try {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
  
  static getPerformanceMetrics() {
    return {
      bundleSize: this.getBundleSize(),
      errorRate: this.getErrorRate(),
      responseTime: this.getAverageResponseTime(),
      chatUsage: this.getChatUsageStats()
    };
  }
}
```

## 15. Open Questions & Future Considerations

### Immediate Implementation Questions

- **Streaming Support**: Should we implement streaming responses for better UX?
- **Markdown Rendering**: Do we need rich text responses or stick to plain text?
- **Voice Interface**: Future consideration for accessibility enhancement?

### Performance Optimizations

- **Service Worker**: Cache chat responses for offline scenarios?
- **WebWorkers**: Move embedding calculations to background thread?
- **CDN Integration**: Optimize asset delivery for global users?

### Analytics & Insights

- **User Journey Tracking**: How do recruiters navigate after chat interactions?
- **Question Pattern Analysis**: What types of questions are most common?
- **Conversion Metrics**: Chat engagement to contact form completion?

---

**Implementation Status**: This frontend architecture is ready for Epic 1 implementation. All components, services, and integration patterns are defined with comprehensive error handling and performance safeguards.

**Next Steps**: Begin implementation with Epic 0 infrastructure setup, then proceed to Epic 1 frontend development following this architecture guide.