"""
FastAPI Backend for Giuseppe Rumore's Portfolio CV Assistant
Optimized for Hugging Face Spaces deployment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
import os
import torch
import psutil
import numpy as np
from pathlib import Path
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import re
from typing import List, Dict, Any, Optional

# Optional imports for AI features
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    print("Sentence transformers imported successfully")
except ImportError as e:
    print(f"Failed to import sentence_transformers: {e}")
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    print("OpenAI imported successfully")
except ImportError as e:
    print(f"Failed to import OpenAI: {e}")
    OpenAI = None
    OPENAI_AVAILABLE = False

# Import our custom modules
from config import get_settings
from middleware import RateLimitMiddleware, create_error_response
from cv_content_extractor import CVContentExtractor

class SemanticSearchService:
    """Service for semantic search using sentence embeddings"""
    
    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.content_embeddings = None
        self.content_chunks = None
        self.is_initialized = False
    
    def load_cv_content(self):
        """Load and prepare CV content for semantic search"""
        try:
            # Try to load AI-ready content first
            ai_content_path = Path(__file__).parent / "data" / "cv_ai_content.json"
            
            cv_data = None
            if ai_content_path.exists():
                with open(ai_content_path, 'r', encoding='utf-8') as f:
                    cv_data = json.load(f)
                source = "ai_content"
            else:
                raise FileNotFoundError("No CV content files found")
            
            # Prepare content chunks for embedding
            self.content_chunks = []
            
            # Process AI-ready content format
            for section, content in cv_data.items():
                if isinstance(content, str) and content.strip():
                    self.content_chunks.append({
                        "content": content,
                        "section": section,
                        "source": "ai_content"
                    })
            
            # Generate embeddings for all content chunks
            if self.embedding_model and self.content_chunks:
                texts = [chunk["content"] for chunk in self.content_chunks]
                self.content_embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
                self.is_initialized = True
                print(f"Loaded {len(self.content_chunks)} content chunks for semantic search")
            
        except Exception as e:
            print(f"Error loading CV content for semantic search: {e}")
            self.is_initialized = False
    
    def search(self, query: str, max_results: int = 5, min_confidence: float = 0.25):
        """Perform semantic search on CV content"""
        if not self.is_initialized or not self.embedding_model:
            raise ValueError("Semantic search service not initialized")
        
        # Preprocess query to expand company names
        expanded_query = self._preprocess_query(query)
        if expanded_query != query:
            print(f"Expanded query from '{query}' to '{expanded_query}'")
        
        # Encode the query
        query_embedding = self.embedding_model.encode([expanded_query], convert_to_numpy=True)
        
        # Calculate cosine similarities
        similarities = np.dot(self.content_embeddings, query_embedding.T).flatten()
        
        # Get top results above confidence threshold
        results = []
        for i, similarity in enumerate(similarities):
            if similarity >= min_confidence:
                results.append({
                    "content": self.content_chunks[i]["content"],
                    "section": self.content_chunks[i]["section"],
                    "source": self.content_chunks[i]["source"],
                    "confidence": float(similarity)
                })
        
        # Sort by confidence and limit results
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results[:max_results]
    
    def _preprocess_query(self, query: str) -> str:
        """
        Preprocess query to expand company names and improve semantic matching.
        """
        # Company name mappings based on CV content
        company_mappings = {
            "alten": "ALTEN GmbH Engineering Consultant Cologne Ford suppliers automotive component",
            "imi": "IMI Climate Control Mechanical Engineer Basel Switzerland components HVAC",
            "steltix": "Steltix ERP Consultant Berlin Germany software integration implementation",
            "european patent office": "European Patent Office Munich patent management analysis machine tools plastic welding"
        }
        
        # Skill category mappings - generic terms that should find relevant content
        skill_mappings = {
            "computer vision": "image processing visual recognition computer vision object detection",
            "machine learning": "ML artificial intelligence data science predictive analytics",
            "deep learning": "neural networks AI machine learning data science",
            "programming": "coding development software programming languages",
            "frameworks": "tools libraries frameworks software development",
            "languages": "programming languages coding development"
        }
        
        # Spoken language context mappings
        language_mappings = {
            "spoken languages": "native speaker fluent advanced proficiency language skills",
            "languages speaks": "native speaker fluent advanced proficiency language skills",
            "what languages": "native speaker fluent advanced proficiency language skills"
        }
        
        query_lower = query.lower()
        expanded_parts = [query]
        
        # Add language context if this is about spoken languages
        for phrase, expansion in language_mappings.items():
            if phrase in query_lower:
                expanded_parts.append(expansion)
                break  # Only apply one language mapping
        
        # Add skill expansions if no language context was added
        if len(expanded_parts) == 1:  # No language mapping was added
            for keyword, expansion in skill_mappings.items():
                if keyword in query_lower:
                    expanded_parts.append(expansion)
        
        # Add company expansions
        for keyword, expansion in company_mappings.items():
            if keyword in query_lower:
                expanded_parts.append(expansion)
        
        return " ".join(expanded_parts)

class ConversationalAIService:
    """Service for generating natural language responses using retrieved content"""
    
    def __init__(self):
        self.openai_client = None
        self.is_initialized = False
        self.settings = get_settings()
    
    def load_model(self):
        """Load conversational AI model"""
        try:
            # Check if OpenAI should be used
            if self.settings.use_openai and self.settings.openai_api_key and OPENAI_AVAILABLE:
                # Initialize OpenAI client without proxies parameter (fixed for openai>=1.0)
                self.openai_client = OpenAI(
                    api_key=self.settings.openai_api_key,
                    timeout=30.0  # Set timeout instead of proxies
                )
                self.is_initialized = True
                print(f"OpenAI client initialized with model: {self.settings.openai_model}")
                return True
            else:
                print("OpenAI configuration not available")
                return False
                
        except Exception as e:
            print(f"Error loading conversational AI model: {e}")
            self.is_initialized = False
            return False
    
    def generate_response(self, user_question: str, context_chunks: List[Dict], session_history: List[Dict] = None) -> Dict:
        """Generate a conversational response based on retrieved context"""
        if not self.is_initialized:
            return {
                "text": "I'm sorry, but I'm currently unable to process your question. Please try again later.",
                "confidence": 0.0,
                "sources": [],
                "response_type": "error"
            }
        
        try:
            # Build context from retrieved chunks
            context_text = self._build_context_from_chunks(context_chunks)
            
            # Try direct fact extraction first (more reliable)
            extracted_response = self._extract_factual_response(user_question, context_text, context_chunks)
            if extracted_response:
                return extracted_response
            
            # Use OpenAI for complex responses
            if self.openai_client:
                return self._generate_openai_response(user_question, context_text, context_chunks)
            else:
                return self._generate_fallback_response(user_question, context_chunks)
                
        except Exception as e:
            print(f"Error generating response: {e}")
            return {
                "text": "I'm sorry, but I encountered an error while processing your question.",
                "confidence": 0.0,
                "sources": [],
                "response_type": "error"
            }
    
    def _extract_factual_response(self, question: str, context: str, context_chunks: List[Dict]) -> Dict:
        """Extract factual information directly from context without AI generation"""
        question_lower = question.lower()
        
        # Spoken languages question (prioritize this over programming languages)
        if any(keyword in question_lower for keyword in ['what languages', 'languages speak', 'spoken languages', 'languages does']):
            # Look for language proficiency info
            for chunk in context_chunks:
                if 'language_' in chunk['section']:
                    languages = []
                    for lang_chunk in context_chunks:
                        if 'language_' in lang_chunk['section']:
                            languages.append(lang_chunk['content'])
                    if languages:
                        lang_text = ', '.join([lang.replace('Language: ', '') for lang in languages])
                        return {
                            "text": f"Giuseppe speaks: {lang_text}",
                            "confidence": 0.95,
                            "sources": [chunk["section"] for chunk in context_chunks if 'language_' in chunk['section']],
                            "response_type": "high_confidence"
                        }
        
        # No direct factual match found
        return None
    
    def _generate_openai_response(self, user_question: str, context_text: str, context_chunks: List[Dict]) -> Dict:
        """Generate response using OpenAI API"""
        try:
            # Create professional prompt for OpenAI
            system_prompt = """You are Giuseppe Rumore's professional AI assistant, helping recruiters and potential employers understand his capabilities and expertise.

Your role:
- Present Giuseppe's qualifications in the most compelling and professional way
- Focus on his strengths, achievements, and what he CAN do for potential employers
- Highlight relevant experience, skills, and projects that match the inquiry
- Be enthusiastic about his capabilities while staying factual
- Use a confident, positive tone that positions Giuseppe as a strong candidate

Response guidelines:
- Lead with Giuseppe's strengths and relevant experience
- Use specific examples from his CV to demonstrate capabilities
- Quantify achievements when available (percentages, improvements, results)
- Frame information positively - focus on what he brings to the table
- Use professional, confident language that showcases his value proposition
- Keep responses concise but comprehensive (under 200 words)
- Structure information clearly with bullet points for easy scanning
- Always conclude with Giuseppe's potential value or next steps for the recruiter

Avoid:
- Mentioning what's NOT in the CV or what he lacks
- Negative framing or limitations
- Uncertain language ("might", "possibly", "not sure")
- Technical jargon without context for business value"""
            
            # Always provide comprehensive context - focus on capabilities and achievements
            if not context_text or context_text.strip() == "":
                context_text = """Giuseppe Rumore is an accomplished Data Scientist and ML Engineer with extensive experience in developing and optimizing models for industrial applications. 
                
Key Strengths & Capabilities:
• Expertise: Machine Learning, Deep Learning, Data Analytics with proven industrial applications
• Technical Proficiency: Python, TensorFlow, PyTorch with hands-on project experience
• Educational Foundation: MSc Mechanical Engineering with R&D specialization from INSA Lyon
• Industry Experience: Led data-driven improvements at IMI Climate Control (30% defect detection improvement, 20% testing time reduction)
• Project Portfolio: Advanced ML implementations including computer vision, NLP, and automation
• Multilingual: 6 languages including native Italian/Albanian, C1 English/Spanish/French, B2 German
• Current Focus: Advancing Data Science and MLOps expertise at Université Paris 1 Panthéon-Sorbonne
• Location: Based in Berlin, Germany with European work authorization"""
            
            user_prompt = f"""Giuseppe's Professional Background:
{context_text}

Recruiter Question: {user_question}

Please provide a compelling response that showcases Giuseppe's relevant capabilities and experience. Focus on what he brings to the table and how his background aligns with what the recruiter is looking for. Present him as a strong candidate while being factual and specific."""
            
            response = self.openai_client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            # Enhance formatting for better readability
            formatted_text = self._format_response_text(generated_text)
            
            # Determine confidence based on context quality
            confidence = 0.9 if context_chunks else 0.7
            
            return {
                "text": formatted_text,
                "confidence": confidence,
                "sources": [chunk["section"] for chunk in context_chunks[:3]] if context_chunks else ["general_info"],
                "response_type": "openai_generated" if context_chunks else "openai_fallback"
            }
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._generate_fallback_response(user_question, context_chunks)
    
    def _format_response_text(self, text: str) -> str:
        """Format response text for better readability"""
        # Add line breaks before bullet points and numbered lists
        text = text.replace('- ', '\n- ')
        text = text.replace('• ', '\n• ')
        
        # Add line breaks before numbered items
        text = re.sub(r'(\d+\.\s)', r'\n\1', text)
        
        # Add line breaks before headers
        text = re.sub(r'(Key points?:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Experience:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Skills?:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Projects?:)', r'\n\1', text, flags=re.IGNORECASE)
        
        # Clean up multiple consecutive newlines
        text = re.sub(r'\n\s*\n+', '\n\n', text)
        
        # Remove leading newlines
        text = text.lstrip('\n')
        
        return text
    
    def _build_context_from_chunks(self, context_chunks: List[Dict]) -> str:
        """Build context string from retrieved content chunks"""
        if not context_chunks:
            return ""
        
        context_parts = []
        for chunk in context_chunks[:3]:  # Use top 3 most relevant chunks
            context_parts.append(f"{chunk['section']}: {chunk['content']}")
        
        return "\n\n".join(context_parts)
    
    def _generate_fallback_response(self, user_question: str, context_chunks: List[Dict]) -> Dict:
        """Generate fallback response when OpenAI is not available"""
        if not context_chunks:
            return {
                "text": "I'm Giuseppe's AI assistant. I can help you learn about his background in Data Science, Machine Learning, and his experience in industrial applications. Please ask about his skills, projects, or work experience!",
                "confidence": 0.5,
                "sources": ["general_info"],
                "response_type": "fallback"
            }
        
        # Use the most relevant chunk for a simple response
        best_chunk = context_chunks[0]
        
        template_response = f"Based on Giuseppe's CV: {best_chunk['content'][:300]}{'...' if len(best_chunk['content']) > 300 else ''}"
        
        return {
            "text": template_response,
            "confidence": 0.6,
            "sources": [best_chunk["section"]],
            "response_type": "template"
        }

# Global variables for model loading
embedding_model = None
semantic_search_service = None
conversational_ai_service = None
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize models on startup"""
    global embedding_model, semantic_search_service, conversational_ai_service
    try:
        # Load sentence transformer model only if available
        if SENTENCE_TRANSFORMERS_AVAILABLE and SentenceTransformer:
            print(f"Loading sentence transformer model: {settings.hf_model_name}")
            try:
                embedding_model = SentenceTransformer(settings.hf_model_name)
                print(f"Embedding model loaded successfully: {settings.hf_model_name}")
                
                # Initialize semantic search service
                semantic_search_service = SemanticSearchService(embedding_model)
                # Load CV content and generate embeddings
                semantic_search_service.load_cv_content()
                
                if semantic_search_service.is_initialized:
                    print(f"Semantic search service initialized with {len(semantic_search_service.content_chunks)} chunks")
                else:
                    print("Semantic search service failed to initialize")
                    
            except Exception as e:
                print(f"Error loading sentence transformer model: {e}")
                embedding_model = None
                semantic_search_service = None
        else:
            print("Sentence transformers not available - running without embedding model")
            embedding_model = None
            semantic_search_service = None
        
        # Load conversational AI service (OpenAI-based)
        if OPENAI_AVAILABLE:
            conversational_ai_service = ConversationalAIService()
            if conversational_ai_service.load_model():
                print("Conversational AI service initialized successfully")
            else:
                print("Conversational AI service initialization failed")
        else:
            print("OpenAI not available - running without conversational AI")
            conversational_ai_service = None
            
    except Exception as e:
        print(f"Error during startup: {e}")
        print("Continuing without AI models")
        embedding_model = None
        semantic_search_service = None
        conversational_ai_service = None
    yield
    # Cleanup (if needed)

app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    requests_per_window=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window
)

# CORS middleware for frontend integration - Allow all origins for HF Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for HF Spaces
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    environment: str
    system_info: dict
    models_loaded: bool

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: List[ChatMessage] = []
    max_context_chunks: int = 5
    min_confidence: float = 0.3

class ChatResponse(BaseModel):
    status: str
    response: str
    confidence: float
    sources: List[str]
    response_type: str
    session_id: str
    timestamp: str

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler with standardized error format"""
    return create_error_response(
        error_type="not_found",
        message=f"Endpoint {request.url.path} not found",
        status_code=404,
        details={"available_endpoints": ["/", "/health", "/docs"]}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler with standardized error format"""
    return create_error_response(
        error_type="internal_server_error",
        message="An internal server error occurred",
        status_code=500,
        details={"contact": "Check logs for details"} if settings.debug_mode else {}
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with system status"""
    try:
        # Get system information
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        system_info = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": memory.percent,
            "memory_available_gb": round(memory.available / (1024**3), 2),
            "disk_percent": disk.percent,
            "disk_free_gb": round(disk.free / (1024**3), 2),
            "python_version": os.sys.version.split()[0],
            "torch_version": torch.__version__,
            "cuda_available": torch.cuda.is_available(),
            "sentence_transformers_available": SENTENCE_TRANSFORMERS_AVAILABLE,
            "semantic_search_initialized": semantic_search_service.is_initialized if semantic_search_service else False,
            "conversational_ai_initialized": conversational_ai_service.is_initialized if conversational_ai_service else False
        }
        
        models_loaded = embedding_model is not None
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
            version=settings.api_version,
            environment=settings.environment,
            system_info=system_info,
            models_loaded=models_loaded
        )
    except Exception as e:
        error_message = f"Health check failed: {str(e)}"
        if settings.debug_mode:
            raise HTTPException(status_code=500, detail=error_message)
        else:
            return create_error_response(
                error_type="health_check_failed",
                message="Health check encountered an error",
                status_code=500
            )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"{settings.api_title} API",
        "version": settings.api_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/health",
        "deployed_on": "Hugging Face Spaces",
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint combining semantic search and conversational AI"""
    try:
        # Generate session ID if not provided
        session_id = request.session_id or f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Check if semantic search is available
        if not semantic_search_service or not semantic_search_service.is_initialized:
            # Fallback response without semantic search
            fallback_response = "I'm Giuseppe's AI assistant! I can help you learn about his background in Data Science, Machine Learning, and engineering. Please ask about his skills, projects, or work experience."
            
            return ChatResponse(
                status="success",
                response=fallback_response,
                confidence=0.5,
                sources=["fallback"],
                response_type="fallback",
                session_id=session_id,
                timestamp=datetime.now(timezone.utc).isoformat() + "Z"
            )
        
        # Perform semantic search
        search_results = semantic_search_service.search(
            query=request.message,
            max_results=request.max_context_chunks,
            min_confidence=request.min_confidence
        )
        
        # Generate conversational response
        if conversational_ai_service and conversational_ai_service.is_initialized:
            ai_response = conversational_ai_service.generate_response(
                user_question=request.message,
                context_chunks=search_results,
                session_history=request.history
            )
        else:
            # Simple fallback when AI service is not available
            if search_results:
                best_match = search_results[0]
                ai_response = {
                    "text": f"Based on Giuseppe's background: {best_match['content'][:200]}...",
                    "confidence": best_match["confidence"],
                    "sources": [best_match["section"]],
                    "response_type": "semantic_only"
                }
            else:
                ai_response = {
                    "text": "I don't have specific information to answer that question about Giuseppe's background.",
                    "confidence": 0.3,
                    "sources": [],
                    "response_type": "no_match"
                }
        
        return ChatResponse(
            status="success",
            response=ai_response["text"],
            confidence=ai_response["confidence"],
            sources=ai_response["sources"],
            response_type=ai_response["response_type"],
            session_id=session_id,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if settings.debug_mode:
            raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="Internal server error in chat processing")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)