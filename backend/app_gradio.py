"""
Gradio wrapper for Giuseppe Rumore's Portfolio Chat.

This file provides a Gradio interface that can run alongside or connect to 
the existing FastAPI backend for deployment and integration with giusepperumore.com.
"""

import gradio as gr
import json
import requests
from datetime import datetime
from typing import Dict, Any, List, Tuple
import uvicorn
import threading
import time
import subprocess
import sys
import os
from apscheduler.schedulers.background import BackgroundScheduler

# Configuration
BACKEND_URL = "http://localhost:7860"  # Your existing backend
GRADIO_PORT = 7861  # Different port to avoid conflicts

class BackendManager:
    """Manages connection to the existing FastAPI backend"""
    
    def __init__(self):
        self.base_url = BACKEND_URL
        self.is_available = False
        self.check_backend_health()
        
    def check_backend_health(self):
        """Check if the backend is available and responding"""
        try:
            # Try the health endpoint first
            response = requests.get(f"{self.base_url}/health", timeout=2)
            self.is_available = response.status_code == 200
        except:
            try:
                # If health endpoint doesn't exist, try a simple GET
                response = requests.get(self.base_url, timeout=2)
                self.is_available = response.status_code in [200, 404]  # 404 is fine, means server is running
            except:
                self.is_available = False
        
        return self.is_available
    
    def get_status(self):
        """Get backend status information"""
        if self.check_backend_health():
            return {
                "status": "🟢 Connected",
                "backend_url": self.base_url,
                "timestamp": datetime.now().isoformat(),
                "message": "Backend is running and responsive"
            }
        else:
            return {
                "status": "🔴 Disconnected", 
                "backend_url": self.base_url,
                "timestamp": datetime.now().isoformat(),
                "message": "Backend is not responding. Please ensure it's running on port 7860."
            }
                
    def chat_with_backend(self, message: str) -> str:
        """Send message to the actual FastAPI backend"""
        print(f"📤 Sending to backend: {message}")  # Debug log
        
        if not message.strip():
            return "Please ask me something about Giuseppe's experience!"
            
        if not self.check_backend_health():
            return "⚠️ Backend is not available. Please ensure the FastAPI server is running on localhost:7860."
            
        try:
            response = requests.post(
                f"{self.base_url}/chat",
                json={"message": message},
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"📥 Backend status: {response.status_code}")  # Debug log
            
            if response.status_code == 200:
                data = response.json()
                print(f"📋 Backend data: {data.get('status', 'unknown')}")  # Debug log
                
                if data["status"] == "success":
                    return data["response"]
                else:
                    return f"Sorry, I encountered an error: {data.get('error', 'Unknown error')}"
            else:
                return f"Sorry, the backend returned an error (status {response.status_code}). Please try again."
                
        except requests.exceptions.Timeout:
            return "Sorry, the request timed out. Please try asking again."
        except requests.exceptions.ConnectionError:
            return "Sorry, I can't connect to the backend right now. Please ensure it's running on localhost:7860."
        except Exception as e:
            error_msg = f"Sorry, I encountered an unexpected error: {str(e)}"
            print(f"❌ Exception: {error_msg}")  # Debug log
            return error_msg

def chat_interface_handler(message: str, history) -> str:
    """Handler for ChatInterface - connects to backend"""
    print(f"🔄 Received message: {message}")  # Debug log
    
    try:
        backend = BackendManager()
        response = backend.chat_with_backend(message)
        print(f"✅ Backend response: {response[:100]}...")  # Debug log
        return response
    except Exception as e:
        error_msg = f"Error in chat handler: {str(e)}"
        print(f"❌ {error_msg}")  # Debug log
        return error_msg

def create_gradio_interface():
    """Create and configure the Gradio interface"""
    
    # Initialize the backend manager
    backend_manager = BackendManager()

    # Custom CSS for professional styling with proper text visibility
    css = """
    #chatbot {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        border: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border-radius: 18px 18px 5px 18px;
    }
    
    .message.bot {
        background: #ffffff !important;
        color: #000000 !important;
        border-radius: 18px 18px 18px 5px;
        border-left: 4px solid #667eea;
    }
    
    /* Ensure all bot message text is visible */
    .message.bot p, .message.bot div, .message.bot span {
        color: #000000 !important;
    }
    
    /* Additional visibility fixes */
    .chatbot .message.bot {
        background-color: #ffffff !important;
        color: #000000 !important;
    }
    
    .chatbot .message.bot * {
        color: #000000 !important;
    }
    }
    
    .gradio-container {
        max-width: 900px !important;
        margin: 0 auto;
    }
    """
    
    # Simple chat function for direct use
    def chat_fn(message, history):
        """Simple chat function that works with Gradio 5.45"""
        print(f"🔄 Chat function called with: {message}")
        try:
            response = backend_manager.chat_with_backend(message)
            print(f"✅ Response generated: {response[:50]}...")
            return response
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(f"❌ Chat function error: {error_msg}")
            return error_msg
    
    # Create the main interface using Blocks for more control
    with gr.Blocks(
        title="Chat with Giuseppe Rumore - AI Assistant",
        theme=gr.themes.Soft(
            primary_hue="blue",
            secondary_hue="blue",
            neutral_hue="slate"
        ),
        css=css
    ) as interface:
        
        # Header
        gr.HTML("""
        <div style="text-align: center; color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin-bottom: 20px;">
            <h1>💬 Chat with Giuseppe Rumore</h1>
            <p>Ask me anything about Giuseppe's professional experience, skills, and background!</p>
            <p style="font-size: 12px; color: #666;">🔗 Integrate this chat into your website: <code>https://your-gradio-url.com</code></p>
        </div>
        """)
        
        # Use the simpler ChatInterface with minimal parameters
        chat_interface = gr.ChatInterface(
            fn=chat_fn,
            examples=[
                "What is Giuseppe's experience with Python?",
                "Tell me about Giuseppe's machine learning background",
                "What technologies does Giuseppe work with?",
                "What languages does Giuseppe speak?",
                "What is Giuseppe's educational background?",
                "Tell me about Giuseppe's engineering experience",
                "What projects has Giuseppe worked on?"
            ]
        )        # Status and information section
        with gr.Accordion("📊 Backend Status & Info", open=False):
            status_display = gr.JSON(label="Backend Status")
            refresh_status_btn = gr.Button("Refresh Status", variant="secondary", size="sm")
            
            def get_current_status():
                return backend_manager.get_status()
            
            refresh_status_btn.click(get_current_status, outputs=status_display)
            interface.load(get_current_status, outputs=status_display)
        
        # Footer with integration info
        gr.HTML("""
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
            <p><strong>For giusepperumore.com integration:</strong></p>
            <p>📎 <strong>Embed Code:</strong> <code>&lt;iframe src="https://your-gradio-url.com" width="100%" height="600px"&gt;&lt;/iframe&gt;</code></p>
            <p>🔗 <strong>API Endpoint:</strong> <code>POST /chat</code> with JSON payload <code>{"message": "your question"}</code></p>
            <p>💻 <strong>Source:</strong> <a href="https://github.com/pepperumo/personal_porfolio_website" target="_blank">GitHub Repository</a></p>
        </div>
        """)
    
    return interface

def setup_health_monitoring():
    """Setup periodic health checks for the backend"""
    def health_check():
        backend = BackendManager()
        if not backend.check_backend_health():
            print(f"⚠️ Backend health check failed at {datetime.now()}")
        else:
            print(f"✅ Backend healthy at {datetime.now()}")
    
    # Note: APScheduler is optional - only use if installed
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            func=health_check,
            trigger="interval",
            seconds=60  # Check every minute
        )
        scheduler.start()
        return scheduler
    except ImportError:
        print("APScheduler not available - skipping health monitoring")
        return None

if __name__ == "__main__":
    print("🌟 Starting Giuseppe Rumore's Portfolio Chat Interface")
    print(f"📡 Connecting to backend at {BACKEND_URL}")
    
    # Check if backend is available
    backend = BackendManager()
    if backend.check_backend_health():
        print("✅ Backend is available")
    else:
        print("⚠️ Backend is not responding. Please ensure it's running on localhost:7860")
        print("   You can start it with: python app.py")
    
    # Setup health monitoring if possible
    scheduler = setup_health_monitoring()
    
    # Create and launch the Gradio interface
    print(f"🎨 Creating Gradio interface on port {GRADIO_PORT}")
    demo = create_gradio_interface()
    
    try:
        print(f"🚀 Launching Gradio app at http://localhost:{GRADIO_PORT}")
        print("🌐 Use share=True to get a public URL for giusepperumore.com integration")
        
        demo.launch(
            server_name="0.0.0.0",
            server_port=GRADIO_PORT,
            show_error=True,
            share=True,  # Creates public URL for integration
            inbrowser=True,
            quiet=False
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        if scheduler:
            scheduler.shutdown()
        print("✅ Cleanup complete")