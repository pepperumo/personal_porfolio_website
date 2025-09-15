#!/usr/bin/env python3
"""Test the chat handler function directly"""

from app_gradio import chat_interface_handler

# Test the handler
try:
    print("Testing chat handler...")
    result = chat_interface_handler('Hi', [])
    print(f"Success! Result: {result}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()