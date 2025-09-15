import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import json

# Import the modules to test
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_basic_api_import():
    """Test that the app module can be imported without errors"""
    try:
        from app import app
        assert app is not None
    except Exception as e:
        pytest.fail(f"Failed to import app: {e}")

if __name__ == "__main__":
    pytest.main([__file__])
