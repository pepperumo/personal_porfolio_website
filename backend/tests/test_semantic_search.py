import pytest
import numpy as np
from unittest.mock import Mock, patch, MagicMock
import json
from pathlib import Path

# Import the modules to test
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import SemanticSearchService, ConversationalAIService

class TestSemanticSearchService:
    """Test cases for SemanticSearchService"""
    
    @pytest.fixture
    def mock_embedding_model(self):
        """Create a mock embedding model"""
        model = Mock()
        # Mock encode method to return consistent embeddings
        model.encode.return_value = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
        return model
    
    @pytest.fixture
    def semantic_service(self, mock_embedding_model):
        """Create a SemanticSearchService instance with mock model"""
        return SemanticSearchService(mock_embedding_model)
    
    def test_init(self, mock_embedding_model):
        """Test SemanticSearchService initialization"""
        service = SemanticSearchService(mock_embedding_model)
        
        assert service.embedding_model == mock_embedding_model
        assert service.content_embeddings is None
        assert service.content_chunks is None
        assert service.is_initialized is False
    
    def test_search_not_initialized(self, semantic_service):
        """Test search when service is not initialized"""
        semantic_service.is_initialized = False
        
        with pytest.raises(ValueError, match="Semantic search service not initialized"):
            semantic_service.search("test query")
    
    def test_search_success(self, semantic_service):
        """Test successful semantic search"""
        # Setup service with mock data
        semantic_service.content_chunks = [
            {"content": "Python programming skills", "section": "skills", "source": "test"},
            {"content": "Data science experience", "section": "experience", "source": "test"}
        ]
        semantic_service.content_embeddings = np.array([[0.8, 0.9], [0.3, 0.4]])
        semantic_service.is_initialized = True
        
        # Mock query embedding
        semantic_service.embedding_model.encode.return_value = np.array([[0.9, 0.8]])
        
        results = semantic_service.search("Python skills", max_results=2, min_confidence=0.1)
        
        assert len(results) == 2
        assert results[0]["confidence"] > results[1]["confidence"]  # Sorted by confidence
        assert all("content" in r and "section" in r and "confidence" in r for r in results)

class TestConversationalAIService:
    """Test cases for ConversationalAIService"""
    
    @pytest.fixture
    def ai_service(self):
        """Create a ConversationalAIService instance"""
        return ConversationalAIService("test-model")
    
    def test_init(self, ai_service):
        """Test ConversationalAIService initialization"""
        assert ai_service.chat_model_name == "test-model"
        assert ai_service.is_initialized is False
        assert ai_service.text_generator is None
    
    def test_build_context_from_chunks(self, ai_service):
        """Test context building from search results"""
        mock_chunks = [
            {"section": "experience_0", "content": "Software Engineer at TechCorp", "confidence": 0.9},
            {"section": "skills_technical", "content": "Python, JavaScript, React", "confidence": 0.8},
            {"section": "education_0", "content": "Computer Science Degree", "confidence": 0.7},
        ]
        
        context = ai_service._build_context_from_chunks(mock_chunks)
        
        assert "experience_0: Software Engineer at TechCorp" in context
        assert "skills_technical: Python, JavaScript, React" in context
        assert "education_0: Computer Science Degree" in context
    
    def test_build_context_empty_chunks(self, ai_service):
        """Test context building with empty chunks"""
        context = ai_service._build_context_from_chunks([])
        assert context == ""
    
    def test_create_professional_prompt(self, ai_service):
        """Test professional prompt creation"""
        question = "What programming languages do you know?"
        context = "skills_technical: Python, JavaScript, React"
        
        prompt = ai_service._create_professional_prompt(question, context)
        
        assert "Giuseppe Rumore's CV information" in prompt
        assert "recruiter's question professionally" in prompt
        assert question in prompt
        assert context in prompt
        assert "Professional Response:" in prompt
    
    def test_clean_response(self, ai_service):
        """Test response cleaning functionality"""
        # Test basic cleaning
        messy_response = "  Giuseppe has experience with Python and JavaScript  \n\n  "
        cleaned = ai_service._clean_response(messy_response)
        assert cleaned == "Giuseppe has experience with Python and JavaScript."
        
        # Test punctuation addition
        no_punct = "Giuseppe is a software engineer"
        cleaned = ai_service._clean_response(no_punct)
        assert cleaned.endswith(".")
    
    def test_assess_response_quality(self, ai_service):
        """Test response quality assessment"""
        mock_chunks = [{"confidence": 0.8}, {"confidence": 0.6}]
        
        # Test good response
        good_response = "Giuseppe has over 5 years of experience in software development with Python and JavaScript."
        response_type, confidence = ai_service._assess_response_quality(good_response, mock_chunks)
        
        assert response_type in ["high_confidence", "medium_confidence", "low_confidence"]
        assert confidence > 0.7
        
        # Test poor response
        poor_response = "Yes."
        response_type, confidence = ai_service._assess_response_quality(poor_response, mock_chunks)
        
        assert confidence < 0.8
    
    def test_generate_template_response_with_context(self, ai_service):
        """Test template response generation with context"""
        mock_chunks = [
            {"section": "experience_0", "content": "Software Engineer with 5 years of experience in Python development", "confidence": 0.9}
        ]
        
        response = ai_service._generate_template_response("What is your experience?", mock_chunks)
        
        assert response["text"].startswith("Based on Giuseppe's CV:")
        assert "Software Engineer" in response["text"]
        assert response["confidence"] == 0.6
        assert response["sources"] == ["experience_0"]
        assert response["response_type"] == "template"
    
    def test_generate_template_response_no_context(self, ai_service):
        """Test template response generation without context"""
        response = ai_service._generate_template_response("Random question", [])
        
        assert "don't have specific information" in response["text"]
        assert response["confidence"] == 0.3
        assert response["sources"] == []
        assert response["response_type"] == "out_of_scope"

if __name__ == "__main__":
    pytest.main([__file__])
