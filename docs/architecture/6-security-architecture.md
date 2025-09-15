# 6. Security Architecture

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
