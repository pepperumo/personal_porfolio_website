# Deployment Documentation

This directory contains scripts and documentation for deploying Giuseppe Rumore's portfolio website across multiple platforms.

## Architecture Overview

- **Frontend**: React application deployed to GitHub Pages
- **Backend**: FastAPI service deployed to Hugging Face Spaces
- **CI/CD**: GitHub Actions for automated deployment

## Deployment Targets

### Frontend (GitHub Pages)

- **URL**: <https://pepperumo.github.io/personal_porfolio_website/>
- **Technology**: React, GitHub Pages
- **Trigger**: Push to `main` branch
- **Build**: `npm run build`

### Backend (Hugging Face Spaces)

- **URL**: <https://pepperumo-peppegpt-backend.hf.space>
- **Technology**: FastAPI + Gradio, HF Spaces
- **Trigger**: Automated via GitHub Actions
- **Runtime**: Python 3.11

## Scripts

### `sync-versions.sh`

Synchronizes version numbers across frontend and backend components.

```bash
# Synchronize existing versions
./sync-versions.sh sync

# Bump patch version (0.1.0 → 0.1.1)
./sync-versions.sh bump-patch

# Bump minor version (0.1.1 → 0.2.0)
./sync-versions.sh bump-minor

# Bump major version (0.2.0 → 1.0.0)
./sync-versions.sh bump-major

# Check version status
./sync-versions.sh status

# Validate version consistency
./sync-versions.sh validate
```

### `validate-deployment.sh`

Validates both frontend and backend deployments after release.

```bash
# Run full deployment validation
./validate-deployment.sh
```

Tests include:

- Frontend accessibility and asset loading
- Backend health and API endpoints
- CORS configuration
- API functionality (chat and search)

### `rollback.sh`

Rolls back to a previous version in case of deployment issues.

```bash
# Rollback to specific git tag/commit
./rollback.sh v0.1.0

# Rollback to latest commit
./rollback.sh latest
```

## Environment Variables

The following environment variables need to be configured in GitHub repository secrets:

### Required Secrets

- `HF_TOKEN`: Hugging Face access token for Space deployment
- `HF_USERNAME`: Hugging Face username (default: pepperumo)

### Configuration in GitHub

1. Go to repository Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `HF_TOKEN`: Your Hugging Face access token
   - `HF_USERNAME`: Your HF username (optional, defaults to pepperumo)

## Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch**:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **GitHub Actions automatically**:
   - Runs tests for both frontend and backend
   - Builds frontend and deploys to GitHub Pages
   - Deploys backend to Hugging Face Spaces
   - Validates both deployments

### Manual Deployment

#### Frontend Only

```bash
npm ci
npm run build
npm run deploy
```

#### Backend Only

```bash
cd backend
pip install huggingface_hub
python -c "
from huggingface_hub import HfApi
api = HfApi()
api.upload_folder(
    folder_path='.',
    repo_id='pepperumo/peppegpt-backend',
    token='YOUR_HF_TOKEN',
    repo_type='space'
)
"
```

## Version Management

Versions are synchronized across:

- `package.json` (frontend)
- `backend/__init__.py` (backend)
- `version.json` (project-wide tracking)

### Version Schema

- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

## Monitoring & Validation

### Health Checks

- **Frontend**: Basic HTTP accessibility test
- **Backend**: `/health` and `/api/v1/status` endpoints

### API Validation

- **Chat API**: POST `/api/v1/chat/message`
- **Search API**: GET `/api/v1/search?query=test`
- **CORS**: Verify GitHub Pages origin allowed

## Rollback Procedures

### Emergency Rollback

1. **Identify last known good version**:

   ```bash
   git log --oneline
   ```

2. **Execute rollback**:

   ```bash
   ./deploy/rollback.sh <commit-hash>
   ```

3. **Validate rollback**:

   ```bash
   ./deploy/validate-deployment.sh
   ```

### Gradual Rollback

1. **Frontend only**:

   ```bash
   git checkout <commit-hash> -- src/ public/
   npm run deploy
   ```

2. **Backend only**:

   ```bash
   cd backend
   git checkout <commit-hash> -- .
   # Redeploy to HF Spaces
   ```

## Troubleshooting

### Common Issues

1. **GitHub Pages not updating**:
   - Check GitHub Actions workflow status
   - Verify repository settings for Pages source
   - Clear browser cache

2. **HF Spaces deployment failed**:
   - Verify `HF_TOKEN` is set correctly
   - Check HF Spaces build logs
   - Ensure `requirements.txt` is valid

3. **API not accessible**:
   - Wait 1-2 minutes for HF Spaces cold start
   - Check CORS configuration
   - Verify environment variables

### Debug Commands

```bash
# Check current versions
./deploy/sync-versions.sh status

# Validate deployments
./deploy/validate-deployment.sh

# Test backend locally
cd backend
python app.py

# Test frontend locally
npm start
```

## Contacts & Support

- **Repository**: <https://github.com/pepperumo/personal_porfolio_website>
- **Frontend**: <https://pepperumo.github.io/personal_porfolio_website/>
- **Backend**: <https://pepperumo-peppegpt-backend.hf.space>
- **Issues**: GitHub Issues for bug reports and feature requests
