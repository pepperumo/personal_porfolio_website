from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import random

router = APIRouter()

class FallbackChatResponse(BaseModel):
    response: str
    confidence: float
    source: str
    timestamp: str
    fallback: bool = True

class FallbackSearchResponse(BaseModel):
    results: list
    total_results: int
    confidence: float
    source: str
    timestamp: str
    fallback: bool = True

# Predefined fallback responses for when AI services are unavailable
FALLBACK_RESPONSES = [
    "I'm currently experiencing some technical difficulties. Please try again in a moment.",
    "My AI services are temporarily unavailable. You can find more information about my projects on this portfolio page.",
    "I'm having trouble processing your request right now. Feel free to explore my portfolio in the meantime!",
    "Technical maintenance is in progress. Please check back shortly for the full chat experience.",
    "I'm currently offline for updates. Browse my projects and experience while I get back online!"
]

FALLBACK_SEARCH_RESULTS = [
    {
        "title": "About Giuseppe Rumore",
        "content": "Experienced software developer passionate about AI and full-stack development.",
        "relevance": 0.7,
        "type": "about"
    },
    {
        "title": "Technical Skills",
        "content": "Proficient in Python, JavaScript, React, and AI/ML technologies.",
        "relevance": 0.6,
        "type": "skills"
    },
    {
        "title": "Portfolio Projects",
        "content": "Various projects showcasing full-stack development and AI integration capabilities.",
        "relevance": 0.5,
        "type": "projects"
    }
]

@router.post("/chat/message", response_model=FallbackChatResponse)
async def fallback_chat(request: Request, message: Dict[str, Any]):
    """Fallback chat endpoint when AI services are unavailable"""
    response_text = random.choice(FALLBACK_RESPONSES)
    
    return FallbackChatResponse(
        response=response_text,
        confidence=0.3,  # Low confidence indicates fallback
        source="fallback_responder",
        timestamp=datetime.utcnow().isoformat() + "Z",
        fallback=True
    )

@router.get("/search", response_model=FallbackSearchResponse)
async def fallback_search(request: Request, query: Optional[str] = None):
    """Fallback search endpoint when AI services are unavailable"""
    
    # Return basic portfolio information
    results = FALLBACK_SEARCH_RESULTS.copy()
    
    # If query provided, try to match relevance
    if query:
        query_lower = query.lower()
        for result in results:
            if any(keyword in query_lower for keyword in ["skill", "tech", "python", "javascript"]):
                if result["type"] == "skills":
                    result["relevance"] = 0.8
            elif any(keyword in query_lower for keyword in ["project", "portfolio", "work"]):
                if result["type"] == "projects":
                    result["relevance"] = 0.8
            elif any(keyword in query_lower for keyword in ["about", "who", "giuseppe", "rumo"]):
                if result["type"] == "about":
                    result["relevance"] = 0.8
        
        # Sort by relevance
        results.sort(key=lambda x: x["relevance"], reverse=True)
    
    return FallbackSearchResponse(
        results=results,
        total_results=len(results),
        confidence=0.4,  # Low confidence indicates fallback
        source="fallback_responder",
        timestamp=datetime.utcnow().isoformat() + "Z",
        fallback=True
    )

@router.get("/status")
async def fallback_status():
    """Status endpoint for fallback mode"""
    return {
        "status": "fallback_mode",
        "message": "AI services temporarily unavailable, using fallback responses",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "capabilities": {
            "chat": "limited",
            "search": "basic",
            "ai_processing": "disabled"
        }
    }