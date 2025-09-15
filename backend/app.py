from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import json
import numpy as np
from pathlib import Path
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import psutil
import torch
from typing import List, Dict, Any, Optional

# Optional imports for AI features
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    AutoTokenizer = None
    AutoModelForCausalLM = None
    pipeline = None
    TRANSFORMERS_AVAILABLE = False

try:
    import openai
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    openai = None
    OpenAI = None
    OPENAI_AVAILABLE = False

# Import our custom modules
from config import get_settings
from middleware import RateLimitMiddleware, create_error_response
from fallback import router as fallback_router
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
            structured_content_path = Path(__file__).parent / "data" / "cv_structured.json"
            
            cv_data = None
            if ai_content_path.exists():
                with open(ai_content_path, 'r', encoding='utf-8') as f:
                    cv_data = json.load(f)
                source = "ai_content"
            elif structured_content_path.exists():
                with open(structured_content_path, 'r', encoding='utf-8') as f:
                    cv_data = json.load(f)
                source = "structured_content"
            else:
                raise FileNotFoundError("No CV content files found")
            
            # Prepare content chunks for embedding
            self.content_chunks = []
            
            if source == "ai_content":
                # Process AI-ready content format
                for section, content in cv_data.items():
                    if isinstance(content, str) and content.strip():
                        self.content_chunks.append({
                            "content": content,
                            "section": section,
                            "source": "ai_content"
                        })
            else:
                # Process structured content format
                self._process_structured_content(cv_data)
            
            # Generate embeddings for all content chunks
            if self.embedding_model and self.content_chunks:
                texts = [chunk["content"] for chunk in self.content_chunks]
                self.content_embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
                self.is_initialized = True
                print(f"Loaded {len(self.content_chunks)} content chunks for semantic search")
            
        except Exception as e:
            print(f"Error loading CV content for semantic search: {e}")
            self.is_initialized = False
    
    def _process_structured_content(self, cv_data):
        """Process structured CV content into searchable chunks"""
        # Profile/Summary
        if "profile" in cv_data:
            self.content_chunks.append({
                "content": cv_data["profile"],
                "section": "profile",
                "source": "structured_content"
            })
        
        # Contact info
        if "contact" in cv_data and isinstance(cv_data["contact"], dict):
            contact_text = f"Name: {cv_data['contact'].get('name', '')}, "
            contact_text += f"Title: {cv_data['contact'].get('title', '')}, "
            contact_text += f"Location: {cv_data['contact'].get('location', '')}"
            self.content_chunks.append({
                "content": contact_text,
                "section": "contact",
                "source": "structured_content"
            })
        
        # Experience
        if "experience" in cv_data:
            for i, exp in enumerate(cv_data["experience"]):
                exp_text = f"Position: {exp.get('title', '')} at {exp.get('company', '')}. "
                exp_text += f"Period: {exp.get('period', '')}. "
                exp_text += f"Location: {exp.get('location', '')}. "
                if "responsibilities" in exp:
                    exp_text += "Responsibilities: " + " ".join(exp["responsibilities"])
                
                self.content_chunks.append({
                    "content": exp_text,
                    "section": f"experience_{i}",
                    "source": "structured_content"
                })
        
        # Projects
        if "projects" in cv_data:
            for i, project in enumerate(cv_data["projects"]):
                project_text = f"Project ({project.get('year', '')}): {project.get('title', '')}. "
                project_text += f"Description: {project.get('description', '')}"
                
                self.content_chunks.append({
                    "content": project_text,
                    "section": f"project_{i}",
                    "source": "structured_content"
                })
        
        # Education
        if "education" in cv_data:
            for i, edu in enumerate(cv_data["education"]):
                edu_text = f"Degree: {edu.get('degree', '')} from {edu.get('institution', '')}. "
                edu_text += f"Period: {edu.get('period', '')}. "
                if "details" in edu and edu["details"]:
                    edu_text += "Details: " + " ".join(edu["details"])
                
                self.content_chunks.append({
                    "content": edu_text,
                    "section": f"education_{i}",
                    "source": "structured_content"
                })
        
        # Skills
        if "skills" in cv_data:
            skills_data = cv_data["skills"]
            for skill_category, skills_list in skills_data.items():
                if skills_list:
                    skills_text = f"{skill_category.title()} skills: " + ", ".join(skills_list)
                    self.content_chunks.append({
                        "content": skills_text,
                        "section": f"skills_{skill_category}",
                        "source": "structured_content"
                    })
        
        # Languages
        if "languages" in cv_data:
            for i, lang in enumerate(cv_data["languages"]):
                lang_text = f"Language: {lang.get('language', '')} - {lang.get('proficiency', '')}"
                self.content_chunks.append({
                    "content": lang_text,
                    "section": f"language_{i}",
                    "source": "structured_content"
                })
        
        # Certificates
        if "certificates" in cv_data:
            cert_text = "Certificates: " + ", ".join(cv_data["certificates"])
            self.content_chunks.append({
                "content": cert_text,
                "section": "certificates",
                "source": "structured_content"
            })
    
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
    
    def __init__(self, chat_model_name):
        self.chat_model_name = chat_model_name
        self.tokenizer = None
        self.model = None
        self.text_generator = None
        self.openai_client = None
        self.is_initialized = False
        self.settings = get_settings()
    
    def load_model(self):
        """Load conversational AI model"""
        try:
            # Check if OpenAI should be used
            if self.settings.use_openai and self.settings.openai_api_key and OPENAI_AVAILABLE:
                self.openai_client = OpenAI(api_key=self.settings.openai_api_key)
                self.is_initialized = True
                print(f"OpenAI client initialized with model: {self.settings.openai_model}")
                return True
            
            # Fallback to local models
            if not TRANSFORMERS_AVAILABLE:
                print("Transformers not available - conversational AI disabled")
                return False
            
            # Use a text generation pipeline for better performance on free tier
            self.text_generator = pipeline(
                "text-generation",
                model=self.chat_model_name,
                tokenizer=self.chat_model_name,
                max_new_tokens=self.settings.max_chat_response_tokens,
                temperature=0.9,  # Increase temperature for more varied responses
                do_sample=True,
                pad_token_id=50256  # GPT-2 pad token
            )
            
            self.is_initialized = True
            print(f"Local conversational AI model loaded: {self.chat_model_name}")
            return True
            
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
            
            # Use OpenAI if available, otherwise fallback to local models
            if self.openai_client:
                return self._generate_openai_response(user_question, context_text, context_chunks)
            else:
                return self._generate_ai_response(user_question, context_text, context_chunks, session_history)
                
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
        
        # Programming languages question (only if not about spoken languages)
        elif any(keyword in question_lower for keyword in ['programming languages', 'programming language', 'coding languages']):
            for line in context.split('\n'):
                if 'programming:' in line.lower():
                    prog_info = line.split(':', 1)[1].strip()
                    if prog_info:
                        return {
                            "text": f"Giuseppe knows {prog_info}.",
                            "confidence": 0.95,
                            "sources": [chunk["section"] for chunk in context_chunks[:3]],
                            "response_type": "high_confidence"
                        }
        
        # Computer vision / technical skills questions - let semantic search find relevant content
        elif any(keyword in question_lower for keyword in ['computer vision', 'object detection', 'image processing', 'machine learning', 'deep learning']):
            # Don't try to extract facts - let OpenAI generate detailed response from found context
            return None
        
        # Skills question
        elif 'skills' in question_lower:
            skills_info = []
            for line in context.split('\n'):
                if any(keyword in line.lower() for keyword in ['programming:', 'technical:', 'tools:', 'frameworks:']):
                    category = line.split(':', 1)[0].strip()
                    skills = line.split(':', 1)[1].strip()
                    if skills:
                        skills_info.append(f"{category}: {skills}")
            
            if skills_info:
                skills_text = '. '.join(skills_info)
                return {
                    "text": f"Giuseppe's skills include {skills_text}.",
                    "confidence": 0.9,
                    "sources": [chunk["section"] for chunk in context_chunks[:3]],
                    "response_type": "high_confidence"
                }
        
        # Experience/background question
        elif any(keyword in question_lower for keyword in ['experience', 'background', 'worked']):
            for chunk in context_chunks:
                if 'title:' in chunk['content'].lower() or 'data scientist' in chunk['content'].lower():
                    # Extract title/experience info
                    lines = chunk['content'].split('\n')
                    for line in lines:
                        if 'title:' in line.lower():
                            title_info = line.split(':', 1)[1].strip()
                            return {
                                "text": f"Giuseppe is a {title_info}",
                                "confidence": 0.9,
                                "sources": [chunk["section"] for chunk in context_chunks[:3]],
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
- Technical jargon without context for business value
- Inventing details not supported by CV content"""
            
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
                # GPT-5 works best with minimal parameters - no max_completion_tokens or temperature
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            # Enhance formatting for better readability
            formatted_text = self._format_response_text(generated_text)
            
            # Determine confidence based on context quality
            confidence = 0.9 if context_chunks else 0.7  # Lower confidence for fallback responses
            
            return {
                "text": formatted_text,
                "confidence": confidence,
                "sources": [chunk["section"] for chunk in context_chunks[:3]] if context_chunks else ["general_info"],
                "response_type": "openai_generated" if context_chunks else "openai_fallback"
            }
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Even on error, provide a helpful fallback
            return {
                "text": "I'm Giuseppe's AI assistant. I can help you learn about his background in Data Science, Machine Learning, and his experience in industrial applications. Please ask about his skills, projects, or work experience!",
                "confidence": 0.5,
                "sources": ["general_info"],
                "response_type": "error_fallback"
            }
    
    def _format_response_text(self, text: str) -> str:
        """Format response text for better readability"""
        import re
        
        # Add line breaks before bullet points and numbered lists
        text = text.replace('- ', '\n- ')
        text = text.replace('• ', '\n• ')
        
        # Add line breaks before numbered items
        text = re.sub(r'(\d+\.\s)', r'\n\1', text)
        
        # Add line breaks before "Key points:" or similar headers
        text = re.sub(r'(Key points?:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Experience:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Skills?:)', r'\n\1', text, flags=re.IGNORECASE)
        text = re.sub(r'(Projects?:)', r'\n\1', text, flags=re.IGNORECASE)
        
        # Clean up multiple consecutive newlines
        text = re.sub(r'\n\s*\n+', '\n\n', text)
        
        # Remove leading newlines
        text = text.lstrip('\n')
        
        return text

    def _generate_ai_response(self, user_question: str, context_text: str, context_chunks: List[Dict], session_history: List[Dict] = None) -> Dict:
        """Generate AI response for complex questions"""
        try:
            # Create a professional prompt for recruiter audience
            prompt = self._create_professional_prompt(user_question, context_text, session_history)
            
            # Generate response
            if self.text_generator:
                response = self.text_generator(
                    prompt,
                    max_new_tokens=30,  # Shorter responses to avoid repetition
                    num_return_sequences=1,
                    temperature=0.2,  # Lower temperature for more focused responses
                    do_sample=True,
                    truncation=True,
                    pad_token_id=50256,  # Explicit padding token for GPT models
                    repetition_penalty=1.2  # Reduce repetition
                )[0]["generated_text"]
                
                # Extract only the new generated text (after the prompt)
                generated_text = response[len(prompt):].strip()
                
                # Clean up the response
                cleaned_response = self._clean_response(generated_text)
                
                # Determine response type and confidence
                response_type, confidence = self._assess_response_quality(cleaned_response, context_chunks)
                
                return {
                    "text": cleaned_response,
                    "confidence": confidence,
                    "sources": [chunk["section"] for chunk in context_chunks[:3]],  # Top 3 sources
                    "response_type": response_type
                }
            else:
                # Fallback to template-based response
                return self._generate_template_response(user_question, context_chunks)
                
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return {
                "text": "I apologize, but I encountered an issue while processing your question. Could you please rephrase it?",
                "confidence": 0.0,
                "sources": [],
                "response_type": "error"
            }
    
    def _build_context_from_chunks(self, context_chunks: List[Dict]) -> str:
        """Build context string from retrieved content chunks"""
        if not context_chunks:
            return ""
        
        context_parts = []
        for chunk in context_chunks[:3]:  # Use top 3 most relevant chunks
            context_parts.append(f"{chunk['section']}: {chunk['content']}")
        
        return "\n\n".join(context_parts)
    
    def _create_professional_prompt(self, question: str, context: str, history: List[Dict] = None) -> str:
        """Create a professional prompt for recruiter audience"""
        # Use direct, simple format that works better with GPT-2
        if not context.strip():
            return f"Question: {question}\nAnswer:"
        
        # Extract relevant information based on question type
        question_lower = question.lower()
        
        if "programming languages" in question_lower or "languages" in question_lower:
            # Extract programming info from context
            for line in context.split('\n'):
                if 'programming:' in line.lower():
                    prog_info = line.split(':', 1)[1].strip()
                    return f"Giuseppe Rumore - Programming Skills:\n{prog_info}\n\nQuestion: {question}\nAnswer:"
        
        elif "skills" in question_lower:
            # Extract skills info
            skills_lines = []
            for line in context.split('\n'):
                if any(keyword in line.lower() for keyword in ['programming:', 'technical:', 'tools:', 'frameworks:']):
                    skills_lines.append(line.strip())
            
            if skills_lines:
                skills_text = '\n'.join(skills_lines)
                return f"Giuseppe Rumore - Skills:\n{skills_text}\n\nQuestion: {question}\nAnswer:"
        
        # Fallback: simplified context
        return f"Giuseppe Rumore - CV Information:\n{context[:200]}...\n\nQuestion: {question}\nAnswer:"
    
    def _clean_response(self, response: str) -> str:
        """Clean and format the generated response"""
        # Remove common artifacts from text generation
        response = response.strip()
        
        # Remove any repeated phrases or excessive whitespace
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        
        # Take only the first paragraph for conciseness
        if lines:
            response = lines[0]
        
        # Ensure it ends with proper punctuation
        if response and not response.endswith(('.', '!', '?')):
            response += '.'
        
        return response
    
    def _assess_response_quality(self, response: str, context_chunks: List[Dict]) -> tuple:
        """Assess response quality and determine confidence"""
        if not response or len(response.strip()) == 0:
            return "error", 0.0
        
        # More lenient for DialoGPT - shorter responses are normal
        word_count = len(response.split())
        if word_count < 2:
            return "error", 0.0
        
        # Basic quality checks
        confidence = 0.6  # Base confidence for DialoGPT
        
        # Check if response is relevant to context
        if context_chunks and any(chunk["confidence"] > 0.5 for chunk in context_chunks):
            confidence += 0.2
        
        # Check response length (DialoGPT tends to be more concise)
        if 2 <= word_count <= 30:
            confidence += 0.1
        elif word_count > 30:
            confidence += 0.05  # Longer responses might be less focused
        
        # Determine response type
        if confidence > 0.8:
            response_type = "high_confidence"
        elif confidence > 0.6:
            response_type = "medium_confidence"
        else:
            response_type = "low_confidence"
        
        return response_type, min(confidence, 1.0)
    
    def _generate_template_response(self, question: str, context_chunks: List[Dict]) -> Dict:
        """Generate template-based response as fallback"""
        if not context_chunks:
            return {
                "text": "I don't have specific information to answer that question about Giuseppe's background. You might want to ask about his experience, skills, or projects.",
                "confidence": 0.3,
                "sources": [],
                "response_type": "out_of_scope"
            }
        
        # Use the most relevant chunk for a simple response
        best_chunk = context_chunks[0]
        
        template_response = f"Based on Giuseppe's CV: {best_chunk['content'][:200]}{'...' if len(best_chunk['content']) > 200 else ''}"
        
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
            embedding_model = SentenceTransformer(settings.hf_model_name)
            # Initialize semantic search service
            semantic_search_service = SemanticSearchService(embedding_model)
            # Load CV content and generate embeddings
            semantic_search_service.load_cv_content()
            print(f"Embedding model loaded successfully: {settings.hf_model_name}")
        else:
            print("Sentence transformers not available - running without embedding model")
            embedding_model = None
            semantic_search_service = None
        
        # Load conversational AI model (OpenAI-based)
        if TRANSFORMERS_AVAILABLE or OPENAI_AVAILABLE:
            conversational_ai_service = ConversationalAIService("openai")  # Model name not used when using OpenAI
            conversational_ai_service.load_model()
            print(f"Conversational AI service initialized")
        else:
            print("Transformers not available - running without conversational AI")
            conversational_ai_service = None
            
    except Exception as e:
        print(f"Error loading models: {e}")
        if not settings.enable_fallback_responder:
            print("Warning: Models failed to load but fallback is disabled")
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

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins_list(),
    allow_credentials=settings.allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include fallback router if enabled
if settings.enable_fallback_responder:
    app.include_router(fallback_router, prefix="/api/v1", tags=["fallback"])

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    environment: str
    system_info: dict
    models_loaded: bool
    fallback_enabled: bool

class CVExtractionRequest(BaseModel):
    force_refresh: bool = False

class CVContentResponse(BaseModel):
    status: str
    data: dict
    timestamp: str
    source: str

class CVExtractionResponse(BaseModel):
    status: str
    message: str
    stats: dict
    timestamp: str

class SemanticSearchRequest(BaseModel):
    query: str
    max_results: int = 5
    min_confidence: float = 0.3

class SemanticSearchResult(BaseModel):
    content: str
    source: str
    confidence: float
    section: str

class SemanticSearchResponse(BaseModel):
    status: str
    query: str
    results: list[SemanticSearchResult]
    total_results: int
    timestamp: str

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
            "transformers_available": TRANSFORMERS_AVAILABLE,
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
            models_loaded=models_loaded,
            fallback_enabled=settings.enable_fallback_responder
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
        "fallback_enabled": settings.enable_fallback_responder,
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z"
    }

@app.get("/config")
async def get_config():
    """Configuration endpoint (non-sensitive data only)"""
    return {
        "api_title": settings.api_title,
        "api_version": settings.api_version,
        "environment": settings.environment,
        "rate_limit": {
            "requests": settings.rate_limit_requests,
            "window_seconds": settings.rate_limit_window
        },
        "features": {
            "fallback_responder": settings.enable_fallback_responder,
            "debug_mode": settings.debug_mode
        },
        "cors": {
            "allowed_origins": settings.get_allowed_origins_list(),
            "allow_credentials": settings.allow_credentials
        }
    }

@app.get("/cv-content", response_model=CVContentResponse)
async def get_cv_content():
    """Get structured CV content for AI chat integration"""
    try:
        # Check if AI-ready content exists
        ai_content_path = Path(__file__).parent / "data" / "cv_ai_content.json"
        structured_content_path = Path(__file__).parent / "data" / "cv_structured.json"
        
        if ai_content_path.exists():
            with open(ai_content_path, 'r', encoding='utf-8') as f:
                cv_data = json.load(f)
            source = "ai_content"
        elif structured_content_path.exists():
            with open(structured_content_path, 'r', encoding='utf-8') as f:
                cv_data = json.load(f)
            source = "structured_content"
        else:
            raise HTTPException(
                status_code=404, 
                detail="CV content not found. Please run extraction first using /extract-cv endpoint"
            )
        
        return CVContentResponse(
            status="success",
            data=cv_data,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
            source=source
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="CV content files not found. Please run extraction first."
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Error parsing CV content files. Please re-run extraction."
        )
    except Exception as e:
        if settings.debug_mode:
            raise HTTPException(status_code=500, detail=f"Error loading CV content: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="Internal server error loading CV content")

@app.post("/extract-cv", response_model=CVExtractionResponse)
async def extract_cv_content(request: CVExtractionRequest):
    """Extract and structure CV content for AI knowledge base"""
    try:
        # Check if content already exists and force_refresh is False
        ai_content_path = Path(__file__).parent / "data" / "cv_ai_content.json"
        if ai_content_path.exists() and not request.force_refresh:
            with open(ai_content_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            
            return CVExtractionResponse(
                status="already_exists",
                message="CV content already extracted. Use force_refresh=true to re-extract.",
                stats={
                    "sections": len(existing_data),
                    "total_characters": sum(len(str(v)) for v in existing_data.values())
                },
                timestamp=datetime.now(timezone.utc).isoformat() + "Z"
            )
        
        # Initialize extractor and process CV
        cv_path = Path(__file__).parent.parent / "public" / "cv" / "Giuseppe_Rumore_CV.txt"
        if not cv_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"CV file not found at {cv_path}"
            )
        
        extractor = CVContentExtractor(cv_path)
        
        # Extract and structure content
        structured_content = extractor.structure_content()
        ai_content = extractor.get_content_for_ai()
        
        # Save structured content
        structured_path = Path(__file__).parent / "data" / "cv_structured.json"
        structured_path.parent.mkdir(exist_ok=True)
        with open(structured_path, 'w', encoding='utf-8') as f:
            json.dump(structured_content, f, indent=2, ensure_ascii=False)
        
        # Save AI-ready content
        with open(ai_content_path, 'w', encoding='utf-8') as f:
            json.dump(ai_content, f, indent=2, ensure_ascii=False)
        
        # Calculate stats
        stats = {
            "professional_experience": len(structured_content.get("professional_experience", [])),
            "projects": len(structured_content.get("projects", [])),
            "education": len(structured_content.get("education", [])),
            "languages": len(structured_content.get("languages", [])),
            "certificates": len(structured_content.get("certificates", [])),
            "ai_sections": len(ai_content),
            "total_ai_characters": sum(len(str(v)) for v in ai_content.values())
        }
        
        return CVExtractionResponse(
            status="success",
            message="CV content extracted and structured successfully",
            stats=stats,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z"
        )
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except Exception as e:
        if settings.debug_mode:
            raise HTTPException(status_code=500, detail=f"Extraction error: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="Internal server error during CV extraction")

@app.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(request: SemanticSearchRequest):
    """Perform semantic search on CV content using embeddings"""
    try:
        if not semantic_search_service or not semantic_search_service.is_initialized:
            raise HTTPException(
                status_code=503,
                detail="Semantic search service not available. AI models may not be loaded."
            )
        
        # Perform the search
        search_results = semantic_search_service.search(
            query=request.query,
            max_results=request.max_results,
            min_confidence=request.min_confidence
        )
        
        # Convert to response format
        results = [
            SemanticSearchResult(
                content=result["content"],
                source=result["source"],
                confidence=result["confidence"],
                section=result["section"]
            )
            for result in search_results
        ]
        
        return SemanticSearchResponse(
            status="success",
            query=request.query,
            results=results,
            total_results=len(results),
            timestamp=datetime.now(timezone.utc).isoformat() + "Z"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if settings.debug_mode:
            raise HTTPException(status_code=500, detail=f"Semantic search error: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail="Internal server error during semantic search")



@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint combining semantic search and conversational AI"""
    try:
        # Generate session ID if not provided
        session_id = request.session_id or f"session_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        
        # Check if services are available
        if not semantic_search_service or not semantic_search_service.is_initialized:
            raise HTTPException(
                status_code=503,
                detail="Semantic search service not available. Please try again later."
            )
        
        if not conversational_ai_service or not conversational_ai_service.is_initialized:
            # Fallback to semantic search only
            search_results = semantic_search_service.search(
                query=request.message,
                max_results=request.max_context_chunks,
                min_confidence=request.min_confidence
            )
            
            if search_results:
                # Create a simple response from search results
                best_result = search_results[0]
                fallback_response = f"Based on Giuseppe's CV: {best_result['content'][:200]}{'...' if len(best_result['content']) > 200 else ''}"
                
                return ChatResponse(
                    status="success_fallback",
                    response=fallback_response,
                    confidence=best_result["confidence"],
                    sources=[result["section"] for result in search_results[:3]],
                    response_type="semantic_search_only",
                    session_id=session_id,
                    timestamp=datetime.now(timezone.utc).isoformat() + "Z"
                )
            else:
                return ChatResponse(
                    status="success",
                    response="I don't have specific information to answer that question about Giuseppe's background. You might want to ask about his experience, skills, or projects.",
                    confidence=0.2,
                    sources=[],
                    response_type="out_of_scope",
                    session_id=session_id,
                    timestamp=datetime.now(timezone.utc).isoformat() + "Z"
                )
        
        # Perform semantic search to get relevant context
        search_results = semantic_search_service.search(
            query=request.message,
            max_results=request.max_context_chunks,
            min_confidence=request.min_confidence
        )
        
        # If no results with minimum confidence, try with lower threshold for guaranteed answer
        if not search_results:
            print(f"No results with min_confidence {request.min_confidence}, trying with lower threshold")
            search_results = semantic_search_service.search(
                query=request.message,
                max_results=request.max_context_chunks,
                min_confidence=0.1  # Much lower threshold for fallback
            )
        
        # Generate conversational response (guaranteed to return something)
        ai_response = conversational_ai_service.generate_response(
            user_question=request.message,
            context_chunks=search_results,
            session_history=request.history
        )
        
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
            raise HTTPException(status_code=500, detail="Internal server error during chat processing")

if __name__ == "__main__":
    uvicorn.run(
        app, 
        host=settings.host, 
        port=settings.port,
        log_level="debug" if settings.debug_mode else "info"
    )