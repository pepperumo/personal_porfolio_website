---
title: PeppeGPT - Giuseppe Rumore's CV Assistant
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# PeppeGPT - Giuseppe Rumore's CV Assistant

An intelligent FastAPI-powered assistant that provides detailed information about Giuseppe Rumore's professional background, skills, and experience. This API serves as the backend for [giusepperumore.com](https://giusepperumore.com) and uses advanced semantic search with OpenAI integration to deliver accurate, recruiter-focused responses.

## Features

- 🔍 **Semantic Search**: Advanced embedding-based search through CV content
- 🤖 **AI-Powered Responses**: OpenAI integration for natural, context-aware answers
- 💼 **Recruiter-Focused**: Responses tailored for hiring managers and recruiters
- 📊 **Real-time Analytics**: Performance monitoring and system health checks
- 🚀 **Production Ready**: Optimized for high-availability deployment

## API Endpoints

### Main Endpoints
- `GET /` - API information and health status
- `POST /chat` - Main chat interface for CV queries
- `GET /health` - Detailed system health and model status
- `GET /docs` - Interactive API documentation

### Usage Example

```bash
curl -X POST "https://pepperumo-peppegpt.hf.space/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What machine learning experience does Giuseppe have?"
  }'
```

## About Giuseppe Rumore

Giuseppe is a Data Scientist and ML Engineer based in Berlin, Germany, with extensive experience in:

- **Machine Learning & AI**: Industrial applications, predictive analytics, computer vision
- **Technical Skills**: Python, TensorFlow, PyTorch, FastAPI, Docker
- **Education**: MSc Mechanical Engineering (INSA Lyon), Data Science & MLOps (Université Paris 1)
- **Languages**: 6 languages including native Italian/Albanian, C1 English/Spanish/French
- **Industry Impact**: 30% defect detection improvement, 20% testing time reduction, 10% cost savings

## Technical Stack

- **Backend**: FastAPI + Python 3.9
- **AI Models**: OpenAI GPT, Sentence Transformers (intfloat/e5-large-v2)
- **Search**: Semantic embeddings with cosine similarity
- **Deployment**: Docker on Hugging Face Spaces
- **Frontend Integration**: CORS-enabled for giusepperumore.com

## Environment Variables

The application supports the following environment variables:

- `OPENAI_API_KEY`: OpenAI API key for conversational AI
- `HF_MODEL_NAME`: Hugging Face model name for embeddings
- `ENVIRONMENT`: Deployment environment (production/development)
- `DEBUG_MODE`: Enable debug mode for detailed error messages

## Contact

- **Website**: [giusepperumore.com](https://giusepperumore.com)
- **Email**: pepperumo@gmail.com
- **Location**: Berlin, Germany

---

*This Space provides an intelligent way to explore Giuseppe Rumore's professional background and capabilities. Perfect for recruiters, hiring managers, and anyone interested in learning about his data science and engineering expertise.*