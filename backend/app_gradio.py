"""
Gradio wrapper for Hugging Face Spaces deployment.

This file provides a Gradio interface that wraps the FastAPI backend
for deployment on Hugging Face Spaces platform.
"""

import gradio as gr
import json
import requests
from datetime import datetime
from typing import Dict, Any
import uvicorn
import threading
import time

# Import the FastAPI app
from app import app

class GradioAPIWrapper:
    """Wrapper to run FastAPI alongside Gradio interface"""
    
    def __init__(self):
        self.fastapi_port = 8000
        self.fastapi_host = "127.0.0.1"
        self.base_url = f"http://{self.fastapi_host}:{self.fastapi_port}"
        self.server_thread = None
        
    def start_fastapi_server(self):
        """Start FastAPI server in background thread"""
        def run_server():
            uvicorn.run(app, host=self.fastapi_host, port=self.fastapi_port, log_level="info")
        
        self.server_thread = threading.Thread(target=run_server, daemon=True)
        self.server_thread.start()
        
        # Wait for server to start
        for _ in range(30):  # 30 second timeout
            try:
                response = requests.get(f"{self.base_url}/health", timeout=1)
                if response.status_code == 200:
                    break
            except:
                time.sleep(1)
                
    def chat_interface(self, message: str, history: list) -> str:
        """Handle chat messages through FastAPI backend"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/chat/message",
                json={"message": message},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data.get("response", "Sorry, I couldn't process that.")
                confidence = data.get("confidence", 0.0)
                source = data.get("source", "unknown")
                
                # Add confidence and source info if it's a fallback
                if data.get("fallback", False):
                    bot_response += f"\n\n*[Fallback mode - AI services temporarily unavailable]*"
                
                return bot_response
            else:
                return "Sorry, I'm experiencing technical difficulties. Please try again later."
                
        except Exception as e:
            return f"Error: Unable to connect to backend service. ({str(e)})"
    
    def search_interface(self, query: str) -> str:
        """Handle search queries through FastAPI backend"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/search",
                params={"query": query} if query else {},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                if not results:
                    return "No results found for your query."
                
                formatted_results = []
                for i, result in enumerate(results, 1):
                    title = result.get("title", "Untitled")
                    content = result.get("content", "No content available")
                    relevance = result.get("relevance", 0.0)
                    
                    formatted_results.append(
                        f"**{i}. {title}** (Relevance: {relevance:.1%})\n{content}\n"
                    )
                
                return "\n".join(formatted_results)
            else:
                return "Sorry, search is temporarily unavailable."
                
        except Exception as e:
            return f"Search error: {str(e)}"

def create_gradio_interface():
    """Create and configure the Gradio interface"""
    
    # Initialize the API wrapper
    wrapper = GradioAPIWrapper()
    wrapper.start_fastapi_server()
    
    # Create the Gradio interface with tabs
    with gr.Blocks(
        title="PeppeGPT - Giuseppe Rumore's AI Assistant",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 800px !important;
        }
        .chat-message {
            padding: 10px;
            margin: 5px 0;
            border-radius: 10px;
        }
        """
    ) as interface:
        
        gr.Markdown("""
        # 🤖 PeppeGPT - Giuseppe Rumore's AI Assistant
        
        Welcome to my AI-powered portfolio assistant! You can:
        - **Chat** with me about my experience, skills, and projects
        - **Search** through my portfolio content
        
        *This is the backend API service for [giusepperumore.com](https://pepperumo.github.io/personal_porfolio_website/)*
        """)
        
        with gr.Tabs():
            # Chat Tab
            with gr.TabItem("💬 Chat"):
                gr.Markdown("Ask me anything about Giuseppe's background, skills, or projects!")
                
                chatbot = gr.Chatbot(
                    label="Chat with PeppeGPT",
                    height=400,
                    bubble_full_width=False
                )
                
                with gr.Row():
                    msg_input = gr.Textbox(
                        placeholder="Ask me about Giuseppe's experience, skills, or projects...",
                        label="Your message",
                        lines=2,
                        scale=4
                    )
                    send_btn = gr.Button("Send", variant="primary", scale=1)
                
                def respond(message, history):
                    if not message.strip():
                        return history, ""
                    
                    # Get bot response
                    bot_response = wrapper.chat_interface(message, history)
                    
                    # Update history
                    history.append((message, bot_response))
                    return history, ""
                
                send_btn.click(respond, [msg_input, chatbot], [chatbot, msg_input])
                msg_input.submit(respond, [msg_input, chatbot], [chatbot, msg_input])
            
            # Search Tab
            with gr.TabItem("🔍 Search"):
                gr.Markdown("Search through Giuseppe's portfolio content and projects.")
                
                with gr.Row():
                    search_input = gr.Textbox(
                        placeholder="Search for skills, projects, experience...",
                        label="Search Query",
                        scale=4
                    )
                    search_btn = gr.Button("Search", variant="primary", scale=1)
                
                search_output = gr.Markdown(
                    label="Search Results",
                    value="Enter a search query to find relevant content from Giuseppe's portfolio."
                )
                
                def perform_search(query):
                    if not query.strip():
                        return "Please enter a search query."
                    return wrapper.search_interface(query)
                
                search_btn.click(perform_search, search_input, search_output)
                search_input.submit(perform_search, search_input, search_output)
            
            # API Status Tab
            with gr.TabItem("📊 Status"):
                gr.Markdown("Backend API status and information.")
                
                status_output = gr.JSON(label="API Status")
                refresh_btn = gr.Button("Refresh Status", variant="secondary")
                
                def get_status():
                    try:
                        response = requests.get(f"{wrapper.base_url}/health", timeout=5)
                        if response.status_code == 200:
                            return response.json()
                        else:
                            return {"error": f"HTTP {response.status_code}"}
                    except Exception as e:
                        return {"error": str(e)}
                
                refresh_btn.click(get_status, outputs=status_output)
                
                # Load initial status
                interface.load(get_status, outputs=status_output)
        
        gr.Markdown("""
        ---
        **About this service:**
        - Backend API for Giuseppe Rumore's portfolio website
        - Deployed on Hugging Face Spaces
        - Source code: [GitHub Repository](https://github.com/pepperumo/personal_porfolio_website)
        """)
    
    return interface

if __name__ == "__main__":
    # Create and launch the Gradio interface
    demo = create_gradio_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        show_error=True,
        share=False
    )

# For Hugging Face Spaces deployment, expose the demo globally
demo = create_gradio_interface()