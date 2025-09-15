# PeppeGPT Backend - Hugging Face Spaces

AI-powered chat backend for personal portfolio website.

## Setup

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Hugging Face Spaces Configuration

1. Create a new Space on Hugging Face
2. Select "Gradio" as the SDK (we'll use custom FastAPI)
3. Upload the backend/ folder contents
4. The app will automatically start on port 7860

### Environment Variables

- `PORT`: Server port (default: 7860 for HF Spaces)

### API Endpoints

- `GET /`: Root endpoint with basic info
- `GET /health`: Health check with system status
- `GET /docs`: Interactive API documentation

### Resource Monitoring

The health endpoint provides real-time system metrics:

- CPU usage
- Memory usage and availability
- Disk usage
- Model loading status
- CUDA availability

### Free Tier Limits

- CPU: 2 cores
- RAM: 16GB
- Storage: 50GB
- GPU: Not available on free tier

Monitor usage through the `/health` endpoint to stay within limits.

Monitor usage through the `/health` endpoint to stay within limits.
