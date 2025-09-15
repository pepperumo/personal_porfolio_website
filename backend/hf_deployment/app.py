"""
Hugging Face Spaces Entry Point - Gradio Interface with FastAPI Integration
This file creates a Gradio interface that integrates with the FastAPI backend
"""
import gradio as gr
import json
import requests
from datetime import datetime
from typing import Dict, Any, List
import os
import uvicorn
import threading
import time

# Import the FastAPI app
try:
    from main_fastapi import app as fastapi_app
    FASTAPI_AVAILABLE = True
except ImportError:
    fastapi_app = None
    FASTAPI_AVAILABLE = False
    print("⚠️ FastAPI backend not available - running in demo mode")

class SimpleBackendIntegration:
    """Simple integration with FastAPI backend"""
    
    def __init__(self):
        self.base_url = "http://127.0.0.1:8001"  # Use port 8001 to avoid Gradio conflict
        self.backend_running = False
        
        # Start FastAPI if available
        if FASTAPI_AVAILABLE:
            self.start_backend()
    
    def start_backend(self):
        """Start FastAPI server in background"""
        def run_server():
            try:
                # Use different port to avoid conflict with Gradio
                uvicorn.run(fastapi_app, host="127.0.0.1", port=8001, log_level="warning")
            except Exception as e:
                print(f"Backend startup error: {e}")
        
        # Start server in background thread
        thread = threading.Thread(target=run_server, daemon=True)
        thread.start()
        
        # Wait for server to be ready
        for _ in range(50):  # Increase wait time
            try:
                response = requests.get("http://127.0.0.1:8001/health", timeout=2)
                if response.status_code == 200:
                    self.backend_running = True
                    self.base_url = "http://127.0.0.1:8001"  # Update base URL
                    print("✅ FastAPI backend is running on port 8001")
                    break
            except:
                time.sleep(1)
        
        if not self.backend_running:
            print("❌ Failed to start FastAPI backend - using demo mode")
    
    def call_chat_api(self, message: str) -> str:
        """Call the FastAPI chat endpoint"""
        print(f"🔍 Backend running: {self.backend_running}")
        
        if not self.backend_running:
            print("⚠️ Backend not running - using demo response")
            return self.demo_response(message)
        
        try:
            print(f"📤 Sending request to: {self.base_url}/chat")
            response = requests.post(
                f"{self.base_url}/chat",
                json={
                    "message": message,
                    "session_id": "gradio_session",
                    "history": [],
                    "max_context_chunks": 5,
                    "min_confidence": 0.3
                },
                timeout=30
            )
            
            print(f"📥 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ API Response received: {len(result.get('response', ''))} chars")
                return result.get("response", "Sorry, I couldn't generate a response.")
            else:
                print(f"❌ API Error: {response.status_code} - {response.text}")
                return f"API Error: {response.status_code}"
                
        except Exception as e:
            print(f"❌ Exception calling API: {e}")
            return self.demo_response(message)
    
    def call_search_api(self, query: str) -> str:
        """Call the FastAPI search endpoint"""
        if not self.backend_running:
            return self.demo_search(query)
        
        try:
            response = requests.post(
                f"{self.base_url}/semantic-search",
                json={
                    "query": query,
                    "max_results": 5,
                    "min_confidence": 0.3
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                results = result.get("results", [])
                
                if not results:
                    return "No relevant information found for your query."
                
                formatted_results = []
                for i, item in enumerate(results[:3], 1):
                    confidence = f"{item.get('confidence', 0):.2f}"
                    content = item.get('content', '')[:200] + "..." if len(item.get('content', '')) > 200 else item.get('content', '')
                    formatted_results.append(f"{i}. **Confidence: {confidence}**\n{content}\n")
                
                return "\n".join(formatted_results)
            else:
                return f"Search Error: {response.status_code}"
                
        except Exception as e:
            return self.demo_search(query)
    
    def demo_response(self, message: str) -> str:
        """Demo response when backend is not available"""
        if not message.strip():
            return "Please ask me something about Giuseppe's background!"
        
        return f"""Hi! I'm Giuseppe's AI assistant. You asked: "{message}"

I can help you learn about:
• Giuseppe's programming skills (Python, TensorFlow, PyTorch)
• His work experience (Data Scientist at IMI Climate Control, etc.)
• His educational background (MSc Mechanical Engineering, INSA Lyon)
• His projects and technical expertise

Please ask me specific questions about Giuseppe's background, skills, or experience!"""
    
    def demo_search(self, query: str) -> str:
        """Demo search when backend is not available"""
        if not query.strip():
            return "Please enter a search query!"
        
        return f"""Search results for: "{query}"

🔍 Found relevant information:

• **Programming Skills**: Python, TensorFlow, PyTorch, Scikit-learn
• **Experience**: Data Scientist with expertise in ML/AI applications
• **Education**: MSc Mechanical Engineering, INSA Lyon
• **Projects**: Mobile Nacelle Design, Industrial ML applications

(This is a demonstration - full semantic search will be available once the backend is fully integrated)"""

# Initialize the backend integration
backend = SimpleBackendIntegration()

def chat_interface(message: str, history: List) -> str:
    """Main chat interface function"""
    return backend.call_chat_api(message)

def search_interface(query: str) -> str:
    """Main search interface function"""
    return backend.call_search_api(query)

def create_gradio_interface():
    """Create the Gradio interface for HF Spaces"""
    
    with gr.Blocks(
        title="Giuseppe Rumore - AI Portfolio Assistant",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        """
    ) as demo:
        
        gr.Markdown("""
        # 🤖 Giuseppe Rumore - AI Portfolio Assistant
        
        Welcome! I'm an AI assistant that can help you learn about Giuseppe's background, experience, and skills.
        Ask me anything about his programming expertise, work experience, education, or projects!
        """)
        
        with gr.Tab("💬 Chat"):
            gr.Markdown("### Ask me anything about Giuseppe!")
            
            chatbot = gr.Chatbot(
                height=400,
                placeholder="Ask me about Giuseppe's background..."
            )
            
            with gr.Row():
                msg = gr.Textbox(
                    placeholder="Type your question here...",
                    label="Your Question",
                    lines=2,
                    scale=4
                )
                send_button = gr.Button("Send", variant="primary", scale=1)
            
            def respond(message, chat_history):
                if not message.strip():
                    return chat_history, ""
                
                # Get bot response
                bot_response = chat_interface(message, chat_history)
                
                # Update chat history
                chat_history.append((message, bot_response))
                return chat_history, ""
            
            # Connect both Enter key and Send button
            msg.submit(respond, [msg, chatbot], [chatbot, msg])
            send_button.click(respond, [msg, chatbot], [chatbot, msg])
            
            # Example questions
            gr.Examples(
                examples=[
                    "What programming languages does Giuseppe know?",
                    "Tell me about Giuseppe's work experience",
                    "What's Giuseppe's educational background?",
                    "What projects has Giuseppe worked on?",
                    "What are Giuseppe's key technical skills?"
                ],
                inputs=msg,
                label="Try these example questions:"
            )
        
        with gr.Tab("🔍 CV Search"):
            gr.Markdown("### Search Giuseppe's CV content")
            
            with gr.Row():
                search_input = gr.Textbox(
                    placeholder="Search for specific information...",
                    label="Search Query",
                    scale=3
                )
                search_button = gr.Button("Search", scale=1, variant="primary")
            
            search_output = gr.Textbox(
                label="Search Results",
                lines=12,
                interactive=False
            )
            
            search_button.click(
                search_interface,
                inputs=search_input,
                outputs=search_output
            )
            
            # Search examples
            gr.Examples(
                examples=[
                    "machine learning experience",
                    "Python programming skills",
                    "data science projects",
                    "educational background",
                    "work at IMI Climate Control"
                ],
                inputs=search_input,
                label="Try these search examples:"
            )
        
        with gr.Tab("ℹ️ About"):
            gr.Markdown("""
            ### About Giuseppe Rumore
            
            Giuseppe is a **Data Scientist and ML Engineer** with expertise in developing and optimizing machine learning models for industrial applications.
            
            **Key Highlights:**
            - 🎓 **Education**: MSc Mechanical Engineering, INSA Lyon
            - 💼 **Experience**: Data Scientist roles at IMI Climate Control, Steltix, ALTEN GmbH
            - 🚀 **Skills**: Python, TensorFlow, PyTorch, Machine Learning, Deep Learning
            - 🔬 **Focus**: Industrial applications, operational efficiency, data-driven strategies
            
            ### API Information
            
            This Space provides both a user-friendly chat interface and API endpoints for integration:
            
            - **Chat Endpoint**: `/chat` - Conversational AI interface
            - **Search Endpoint**: `/semantic-search` - Semantic search of CV content
            - **Health Check**: `/health` - API status check
            
            **Frontend Integration**: This backend is designed to work with Giuseppe's React portfolio website deployed on GitHub Pages.
            """)
    
    return demo

# Create and configure the demo
demo = create_gradio_interface()

# This is what HF Spaces will look for
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        show_error=True,
        share=True,
        show_api=True,
        enable_queue=True
    )