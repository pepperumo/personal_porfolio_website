"""
Hugging Face Spaces entry point
This file is required for HF Spaces to recognize the FastAPI app
"""

import os
import sys

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

from app import app

# This is the entry point for Hugging Face Spaces
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)