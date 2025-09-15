# Hugging Face Spaces Deployment Guide

## 🚀 Quick Start

Your backend is ready for Hugging Face Spaces deployment! Here's what to do:

### 1. Create the Hugging Face Space

1. Go to [https://huggingface.co/new-space](https://huggingface.co/new-space)
2. **Important**: Name your space `peppegpt` (to match your frontend configuration)
3. Choose **Gradio** as the SDK
4. Set license to **MIT**
5. Make it **Public** (required for your GitHub Pages frontend to access it)

### 2. Upload Files

Upload all files from the `hf_deployment/` folder to your Space:

```
app.py
app_gradio.py
config.py
middleware.py
fallback.py
cv_content_extractor.py
requirements.txt
README.md
data/ (folder with CV content)
```

### 3. Configure Environment Variables (Optional)

In your Space settings, you can add these environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key (for better responses)
- `USE_OPENAI=true` - Enable OpenAI instead of local models
- `ENVIRONMENT=production` - Set production environment

### 4. Update Frontend Configuration

Your frontend is already configured to use: `https://pepperumo-peppegpt.hf.space/api/chat`

If you use a different Space name, update this in:
`src/features/chat/services/chatService.js`

### 5. Test the Deployment

Once deployed, your API will be available at:
- **Main Interface**: `https://your-username-peppegpt.hf.space`
- **API Endpoint**: `https://your-username-peppegpt.hf.space/api/chat`
- **Health Check**: `https://your-username-peppegpt.hf.space/health`

## 🔧 API Endpoints

Your Hugging Face Space will expose:

- `POST /chat` - Main chat endpoint (used by frontend)
- `GET /health` - Health check and system status
- `POST /semantic-search` - Semantic search through CV content
- `GET /cv-content` - Structured CV data

## 🎯 Expected Frontend Integration

Your React frontend will automatically connect to the deployed backend. The chat widget will:

1. Send user messages to `/chat` endpoint
2. Display AI responses with confidence scores
3. Show source attribution from CV content
4. Handle errors gracefully with fallback responses

## 📊 Monitoring

Monitor your Space through:
- **Hugging Face Interface**: Real-time logs and metrics
- **Health Endpoint**: System resource usage and model status
- **Frontend Error Handling**: Circuit breaker status

## 🔄 Updates

To update your backend:
1. Make changes to files in the `backend/` directory
2. Re-run the setup script to update `hf_deployment/`
3. Upload updated files to your Hugging Face Space
4. The Space will automatically restart with new changes

## 🆘 Troubleshooting

**Common Issues:**
- **Space not starting**: Check logs for missing dependencies
- **Frontend can't connect**: Verify Space name matches frontend config
- **Slow responses**: Consider upgrading to a paid Space tier
- **Model loading errors**: Check available memory in Space settings

**Free Tier Limits:**
- CPU: 2 cores
- RAM: 16GB
- Storage: 50GB
- No GPU access

For better performance, consider upgrading to a paid tier with GPU access.