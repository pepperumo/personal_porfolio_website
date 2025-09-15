#!/bin/bash

# Setup script for Hugging Face Spaces deployment
# This script prepares the backend for deployment

echo "🚀 Setting up PeppeGPT for Hugging Face Spaces deployment..."

# Create deployment directory
mkdir -p hf_deployment
cd hf_deployment

# Copy necessary files
echo "📁 Copying backend files..."
cp ../app.py .
cp ../app_gradio.py .
cp ../config.py .
cp ../middleware.py .
cp ../fallback.py .
cp ../cv_content_extractor.py .
cp ../requirements.txt .

# Copy data directory if it exists
if [ -d "../data" ]; then
    cp -r ../data .
    echo "✅ Data directory copied"
fi

# Create README for Hugging Face Spaces
cat > README.md << 'EOF'
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
EOF

echo "✅ Deployment files prepared in hf_deployment/"
echo ""
echo "📋 Next steps:"
echo "1. Create a new Space on Hugging Face Hub"
echo "2. Choose 'Gradio' as the SDK"
echo "3. Upload the contents of the hf_deployment/ folder"
echo "4. Set any required environment variables in Space settings"
echo "5. The Space will automatically deploy and be available at your-username/space-name"
echo ""
echo "🔗 Your frontend can then connect to: https://your-username-space-name.hf.space"