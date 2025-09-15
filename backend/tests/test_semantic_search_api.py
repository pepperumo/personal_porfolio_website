import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import json

# Import the modules to test
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestSemanticSearchAPI:
    """Test cases for semantic search API endpoints"""
    
    @pytest.fixture
    def mock_semantic_service(self):
        """Create a mock semantic search service"""
        service = Mock()
        service.is_initialized = True
        service.search.return_value = [
            {
                "content": "Python programming skills",
                "section": "skills",
                "source": "ai_content",
                "confidence": 0.85
            },
            {
                "content": "Data science experience",
                "section": "experience", 
                "source": "ai_content",
                "confidence": 0.72
            }
        ]
        return service
    
    @pytest.fixture
    def client(self, mock_semantic_service):
        """Create a test client with mocked dependencies"""
        with patch('app.semantic_search_service', mock_semantic_service):
            from app import app
            return TestClient(app)
    
    def test_semantic_search_success(self, client, mock_semantic_service):
        """Test successful semantic search request"""
        request_data = {
            "query": "Python programming",
            "max_results": 3,
            "min_confidence": 0.3
        }
        
        response = client.post("/semantic-search", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert data["query"] == "Python programming"
        assert data["total_results"] == 2
        assert len(data["results"]) == 2
        
        # Verify result structure
        for result in data["results"]:
            assert "content" in result
            assert "section" in result
            assert "source" in result
            assert "confidence" in result
    
    def test_semantic_search_service_not_initialized(self, client):
        """Test semantic search when service is not initialized"""
        with patch('app.semantic_search_service', None):
            request_data = {
                "query": "Python programming",
                "max_results": 3,
                "min_confidence": 0.3
            }
            
            response = client.post("/semantic-search", json=request_data)
            
            assert response.status_code == 503
            assert "not available" in response.json()["detail"]
    
    def test_semantic_search_invalid_request(self, client, mock_semantic_service):
        """Test semantic search with invalid request data"""
        # Missing required field
        request_data = {
            "max_results": 3,
            "min_confidence": 0.3
        }
        
        response = client.post("/semantic-search", json=request_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_semantic_search_default_parameters(self, client, mock_semantic_service):
        """Test semantic search with default parameters"""
        request_data = {
            "query": "test query"
        }
        
        response = client.post("/semantic-search", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should use default values
        mock_semantic_service.search.assert_called_with(
            query="test query",
            max_results=5,
            min_confidence=0.3
        )

class TestChatAPI:
    """Test cases for chat API endpoints"""
    
    @pytest.fixture
    def mock_semantic_service(self):
        """Create a mock semantic search service"""
        service = Mock()
        service.is_initialized = True
        service.search.return_value = [
            {
                "content": "Giuseppe has 5 years of experience with Python and JavaScript",
                "section": "experience_0",
                "source": "ai_content",
                "confidence": 0.9
            }
        ]
        return service
    
    @pytest.fixture
    def mock_ai_service(self):
        """Create a mock conversational AI service"""
        service = Mock()
        service.is_initialized = True
        service.generate_response.return_value = {
            "text": "Giuseppe has extensive experience with Python and JavaScript, having worked in software development for 5 years.",
            "confidence": 0.85,
            "sources": ["experience_0"],
            "response_type": "high_confidence"
        }
        return service
    
    @pytest.fixture
    def client(self, mock_semantic_service, mock_ai_service):
        """Create a test client with mocked dependencies"""
        with patch('app.semantic_search_service', mock_semantic_service), \
             patch('app.conversational_ai_service', mock_ai_service):
            from app import app
            return TestClient(app)
    
    def test_chat_success(self, client, mock_semantic_service, mock_ai_service):
        """Test successful chat request"""
        request_data = {
            "message": "What programming languages does Giuseppe know?",
            "session_id": "test_session"
        }
        
        response = client.post("/chat", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "Giuseppe" in data["response"]
        assert data["confidence"] > 0.8
        assert "experience_0" in data["sources"]
        assert data["session_id"] == "test_session"
        assert data["response_type"] == "high_confidence"
    
    def test_chat_fallback_mode(self, client, mock_semantic_service):
        """Test chat in fallback mode (AI service unavailable)"""
        with patch('app.conversational_ai_service', None):
            request_data = {
                "message": "What programming languages does Giuseppe know?"
            }
            
            response = client.post("/chat", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["status"] == "success_fallback"
            assert data["response_type"] == "semantic_search_only"
    
    def test_chat_no_context(self, client, mock_semantic_service, mock_ai_service):
        """Test chat when no relevant context is found"""
        # Mock empty search results
        mock_semantic_service.search.return_value = []
        mock_ai_service.generate_response.return_value = {
            "text": "I don't have specific information to answer that question.",
            "confidence": 0.2,
            "sources": [],
            "response_type": "out_of_scope"
        }
        
        request_data = {
            "message": "What is Giuseppe's favorite color?"
        }
        
        response = client.post("/chat", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert data["response_type"] == "out_of_scope"
        assert data["confidence"] < 0.5
    
    def test_chat_invalid_request(self, client, mock_semantic_service, mock_ai_service):
        """Test chat with invalid request data"""
        # Missing required message field
        request_data = {
            "session_id": "test_session"
        }
        
        response = client.post("/chat", json=request_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_chat_auto_session_id(self, client, mock_semantic_service, mock_ai_service):
        """Test chat with auto-generated session ID"""
        request_data = {
            "message": "Test question"
        }
        
        response = client.post("/chat", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have auto-generated session ID
        assert data["session_id"].startswith("session_")

if __name__ == "__main__":
    pytest.main([__file__])
