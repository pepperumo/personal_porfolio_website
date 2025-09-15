#!/bin/bash

# Rollback script for Portfolio deployment
# Usage: ./rollback.sh <version>

set -e

VERSION=${1:-"latest"}
REPO_URL="https://github.com/pepperumo/personal_porfolio_website.git"
HF_USERNAME=${HF_USERNAME:-"pepperumo"}
HF_SPACE="${HF_USERNAME}/peppegpt-backend"

echo "🔄 Rolling back to version: $VERSION"

# Function to rollback frontend
rollback_frontend() {
    echo "📱 Rolling back frontend..."
    
    if [ "$VERSION" = "latest" ]; then
        echo "⚠️  Using latest commit for frontend rollback"
        git checkout main
    else
        git checkout "$VERSION"
    fi
    
    # Rebuild and redeploy
    npm ci
    npm run build
    npm run deploy
    
    echo "✅ Frontend rollback completed"
}

# Function to rollback backend
rollback_backend() {
    echo "🔧 Rolling back backend..."
    
    if [ "$HF_TOKEN" ]; then
        cd backend
        
        if [ "$VERSION" = "latest" ]; then
            echo "⚠️  Using latest commit for backend rollback"
        else
            git checkout "$VERSION" -- .
        fi
        
        # Redeploy to HF Spaces
        python3 -c "
import os
from huggingface_hub import HfApi

token = os.environ.get('HF_TOKEN')
repo_id = '$HF_SPACE'

if token:
    api = HfApi()
    api.upload_folder(
        folder_path='.',
        repo_id=repo_id,
        token=token,
        repo_type='space',
        commit_message=f'Rollback to version $VERSION'
    )
    print('✅ Backend rollback completed')
else:
    print('⚠️  HF_TOKEN not set, manual rollback required')
"
        cd ..
    else
        echo "⚠️  HF_TOKEN not set, skipping backend rollback"
    fi
}

# Function to update version tracking
update_version_tracking() {
    echo "📝 Updating version tracking..."
    
    # Update version.json
    python3 -c "
import json
from datetime import datetime

# Read current version info
try:
    with open('version.json', 'r') as f:
        version_info = json.load(f)
except:
    version_info = {}

# Update with rollback info
version_info.update({
    'current_version': '$VERSION',
    'rollback_timestamp': datetime.utcnow().isoformat() + 'Z',
    'rollback_reason': 'Manual rollback triggered'
})

# Write updated info
with open('version.json', 'w') as f:
    json.dump(version_info, f, indent=2)

print('✅ Version tracking updated')
"
}

# Main rollback process
echo "🚀 Starting rollback process..."

# Confirm rollback
read -p "Are you sure you want to rollback to version $VERSION? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Execute rollbacks
rollback_frontend
rollback_backend
update_version_tracking

echo "✅ Rollback completed successfully!"
echo "🌐 Frontend: https://pepperumo.github.io/personal_porfolio_website/"
echo "🤖 Backend: https://huggingface.co/spaces/$HF_SPACE"
echo "📋 Check deployment status and verify functionality"