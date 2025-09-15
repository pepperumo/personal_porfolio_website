# Setup script for Hugging Face Spaces deployment (PowerShell)
# This script prepares the backend for deployment

Write-Host "🚀 Setting up PeppeGPT for Hugging Face Spaces deployment..." -ForegroundColor Cyan

# Create deployment directory
New-Item -ItemType Directory -Force -Path "hf_deployment" | Out-Null
Set-Location "hf_deployment"

# Copy necessary files
Write-Host "📁 Copying backend files..." -ForegroundColor Yellow
Copy-Item "../app.py" "."
Copy-Item "../app_gradio.py" "."
Copy-Item "../config.py" "."
Copy-Item "../middleware.py" "."
Copy-Item "../fallback.py" "."
Copy-Item "../cv_content_extractor.py" "."
Copy-Item "../requirements.txt" "."

# Copy data directory if it exists
if (Test-Path "../data") {
    Copy-Item "../data" "." -Recurse
    Write-Host "✅ Data directory copied" -ForegroundColor Green
}

# Create README for Hugging Face Spaces
$readmeContent = @"
---
title: PeppeGPT - AI Portfolio Assistant
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app_gradio.py
pinned: false
license: mit
short_description: AI-powered assistant for Giuseppe Rumore's portfolio
tags:
  - chatbot
  - portfolio
  - ai-assistant
  - semantic-search
  - fastapi
  - machine-learning
---

# PeppeGPT - Giuseppe Rumore's AI Assistant

An intelligent assistant that can answer questions about Giuseppe Rumore's professional background, skills, and projects.

## Features

- 💬 **Interactive Chat**: Ask questions about experience, skills, and projects
- 🔍 **Semantic Search**: Search through portfolio content using AI embeddings
- 🎯 **Intelligent Responses**: Powered by OpenAI GPT and local ML models
- 📊 **API Status**: Real-time backend health monitoring

## Usage

1. **Chat Tab**: Ask natural language questions about Giuseppe's background
2. **Search Tab**: Search for specific skills, projects, or experience
3. **Status Tab**: Monitor API health and performance

This Space provides the backend API for [giusepperumore.com](https://pepperumo.github.io/personal_porfolio_website/)

## Technology Stack

- **Backend**: FastAPI with AI/ML capabilities
- **Frontend**: Gradio interface for Hugging Face Spaces
- **AI Models**: Sentence Transformers, OpenAI GPT, Transformers
- **Deployment**: Hugging Face Spaces
"@

$readmeContent | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "✅ Deployment files prepared in hf_deployment/" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://huggingface.co/new-space" -ForegroundColor White
Write-Host "2. Choose 'Gradio' as the SDK" -ForegroundColor White
Write-Host "3. Upload the contents of the hf_deployment/ folder" -ForegroundColor White
Write-Host "4. Set any required environment variables in Space settings" -ForegroundColor White
Write-Host "5. The Space will automatically deploy and be available at your-username/space-name" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your frontend can then connect to: https://your-username-space-name.hf.space" -ForegroundColor Yellow

# Return to original directory
Set-Location ".."