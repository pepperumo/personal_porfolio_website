# 12. Testing Strategy

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
