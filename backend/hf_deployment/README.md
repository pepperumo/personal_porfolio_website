---
title: PeppeGPT - AI Portfolio Assistant
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
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

## API Endpoints

The backend provides a RESTful API with the following endpoints:

- `GET /health` - Health check and system status
- `POST /chat` - Conversational AI endpoint
- `POST /semantic-search` - Semantic search through CV content
- `GET /cv-content` - Structured CV data
- `POST /extract-cv` - Process and extract CV content

## About Giuseppe Rumore

Giuseppe is a Data Scientist and ML Engineer with expertise in:
- Machine Learning & Deep Learning
- Industrial Applications & Optimization
- Python, TensorFlow, PyTorch
- Data Analytics & Visualization