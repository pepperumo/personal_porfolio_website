# 5. Data Architecture

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
