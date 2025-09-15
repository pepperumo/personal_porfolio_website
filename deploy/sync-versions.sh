#!/bin/bash

# Version synchronization script
# Ensures frontend and backend versions are aligned

set -e

VERSION_FILE="version.json"
PACKAGE_JSON="package.json"
BACKEND_VERSION_FILE="backend/__init__.py"

echo "🔄 Synchronizing versions across frontend and backend"

# Function to get current git commit hash
get_commit_hash() {
    git rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# Function to get current git tag
get_current_tag() {
    git describe --tags --exact-match 2>/dev/null || echo "dev"
}

# Function to update package.json version
update_package_version() {
    local new_version=$1
    
    if [ -f "$PACKAGE_JSON" ]; then
        echo "📦 Updating package.json version to $new_version"
        python3 -c "
import json

with open('$PACKAGE_JSON', 'r') as f:
    data = json.load(f)

data['version'] = '$new_version'

with open('$PACKAGE_JSON', 'w') as f:
    json.dump(data, f, indent=2)

print('✅ package.json updated')
"
    fi
}

# Function to update backend version
update_backend_version() {
    local new_version=$1
    
    mkdir -p backend
    echo "🔧 Updating backend version to $new_version"
    
    cat > "$BACKEND_VERSION_FILE" << EOF
"""Backend version information"""

__version__ = "$new_version"
__commit__ = "$(get_commit_hash)"
__build_date__ = "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
EOF
    
    echo "✅ Backend version updated"
}

# Function to update version.json
update_version_json() {
    local frontend_version=$1
    local backend_version=$2
    local commit_hash=$(get_commit_hash)
    local current_tag=$(get_current_tag)
    
    echo "📝 Updating version.json"
    
    python3 -c "
import json
from datetime import datetime

version_data = {
    'version': '$current_tag',
    'frontend_version': '$frontend_version',
    'backend_version': '$backend_version',
    'commit_hash': '$commit_hash',
    'build_timestamp': datetime.utcnow().isoformat() + 'Z',
    'deployment_target': {
        'frontend': 'GitHub Pages',
        'backend': 'Hugging Face Spaces'
    },
    'urls': {
        'frontend': 'https://pepperumo.github.io/personal_porfolio_website/',
        'backend': 'https://pepperumo-peppegpt-backend.hf.space'
    }
}

with open('$VERSION_FILE', 'w') as f:
    json.dump(version_data, f, indent=2)

print('✅ version.json updated')
"
}

# Function to validate version consistency
validate_versions() {
    echo "🔍 Validating version consistency..."
    
    python3 -c "
import json
import sys

# Read package.json
try:
    with open('$PACKAGE_JSON', 'r') as f:
        package_data = json.load(f)
    package_version = package_data.get('version', 'unknown')
except:
    package_version = 'unknown'

# Read version.json
try:
    with open('$VERSION_FILE', 'r') as f:
        version_data = json.load(f)
    tracked_frontend = version_data.get('frontend_version', 'unknown')
    tracked_backend = version_data.get('backend_version', 'unknown')
except:
    tracked_frontend = 'unknown'
    tracked_backend = 'unknown'

print(f'Package.json version: {package_version}')
print(f'Tracked frontend version: {tracked_frontend}')
print(f'Tracked backend version: {tracked_backend}')

if package_version == tracked_frontend:
    print('✅ Versions are synchronized')
    sys.exit(0)
else:
    print('⚠️  Version mismatch detected')
    sys.exit(1)
"
}

# Function to bump version
bump_version() {
    local bump_type=${1:-patch}  # major, minor, patch
    
    echo "📈 Bumping $bump_type version..."
    
    # Get current version from package.json or default to 0.1.0
    current_version=$(python3 -c "
import json
try:
    with open('$PACKAGE_JSON', 'r') as f:
        data = json.load(f)
    print(data.get('version', '0.1.0'))
except:
    print('0.1.0')
" 2>/dev/null)
    
    # Calculate new version
    new_version=$(python3 -c "
version = '$current_version'.split('.')
major, minor, patch = int(version[0]), int(version[1]), int(version[2])

if '$bump_type' == 'major':
    major += 1
    minor = 0
    patch = 0
elif '$bump_type' == 'minor':
    minor += 1
    patch = 0
else:  # patch
    patch += 1

print(f'{major}.{minor}.{patch}')
")
    
    echo "🔄 Version: $current_version → $new_version"
    
    # Update all version files
    update_package_version "$new_version"
    update_backend_version "$new_version"
    update_version_json "$new_version" "$new_version"
    
    echo "✅ Version bump completed: $new_version"
}

# Main function
main() {
    local action=${1:-sync}
    
    case $action in
        "sync")
            echo "🔄 Synchronizing existing versions..."
            if [ -f "$PACKAGE_JSON" ]; then
                current_version=$(python3 -c "import json; print(json.load(open('$PACKAGE_JSON'))['version'])" 2>/dev/null || echo "0.1.0")
                update_backend_version "$current_version"
                update_version_json "$current_version" "$current_version"
                validate_versions
            else
                echo "⚠️  package.json not found, creating default versions..."
                update_package_version "0.1.0"
                update_backend_version "0.1.0"
                update_version_json "0.1.0" "0.1.0"
            fi
            ;;
        "bump-major"|"bump-minor"|"bump-patch")
            bump_type=${action#bump-}
            bump_version "$bump_type"
            ;;
        "validate")
            validate_versions
            ;;
        "status")
            echo "📊 Current version status:"
            if [ -f "$VERSION_FILE" ]; then
                python3 -c "
import json
with open('$VERSION_FILE', 'r') as f:
    data = json.load(f)
print(f\"Version: {data.get('version', 'unknown')}\")
print(f\"Frontend: {data.get('frontend_version', 'unknown')}\")
print(f\"Backend: {data.get('backend_version', 'unknown')}\")
print(f\"Commit: {data.get('commit_hash', 'unknown')}\")
print(f\"Built: {data.get('build_timestamp', 'unknown')}\")
"
            else
                echo "❌ No version.json found"
            fi
            ;;
        *)
            echo "Usage: $0 [sync|bump-major|bump-minor|bump-patch|validate|status]"
            echo ""
            echo "Commands:"
            echo "  sync         - Synchronize versions across all files"
            echo "  bump-major   - Increment major version (x.0.0)"
            echo "  bump-minor   - Increment minor version (x.y.0)"
            echo "  bump-patch   - Increment patch version (x.y.z)"
            echo "  validate     - Check version consistency"
            echo "  status       - Display current version information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"