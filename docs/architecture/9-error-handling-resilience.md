# 9. Error Handling & Resilience

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
