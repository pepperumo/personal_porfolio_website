#!/bin/bash

# Deployment validation script
# Tests both frontend and backend deployments

set -e

FRONTEND_URL="https://pepperumo.github.io/personal_porfolio_website/"
HF_USERNAME=${HF_USERNAME:-"pepperumo"}
BACKEND_URL="https://${HF_USERNAME}-peppegpt-backend.hf.space"
TIMEOUT=30
MAX_RETRIES=3

echo "🔍 Validating Portfolio Deployment"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    local retry_count=0
    
    echo -n "Testing $description... "
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if response=$(curl -s -w "%{http_code}" -m $TIMEOUT "$url" 2>/dev/null); then
            status_code=${response: -3}
            if [ "$status_code" = "$expected_status" ]; then
                echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
                return 0
            else
                echo -e "${YELLOW}⚠ Unexpected status${NC} (HTTP $status_code)"
                return 1
            fi
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                echo -n "retrying... "
                sleep 5
            fi
        fi
    done
    
    echo -e "${RED}✗ FAIL${NC} (timeout or connection error)"
    return 1
}

# Function to test JSON endpoint
test_json_endpoint() {
    local url=$1
    local description=$2
    local expected_key=$3
    
    echo -n "Testing $description... "
    
    if response=$(curl -s -m $TIMEOUT "$url" 2>/dev/null); then
        if echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if '$expected_key' in data else 1)" 2>/dev/null; then
            echo -e "${GREEN}✓ PASS${NC} (JSON structure valid)"
            return 0
        else
            echo -e "${YELLOW}⚠ Invalid JSON${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (connection error)"
        return 1
    fi
}

# Function to test CORS headers
test_cors() {
    local url=$1
    
    echo -n "Testing CORS headers... "
    
    if headers=$(curl -s -I -H "Origin: https://pepperumo.github.io" "$url" 2>/dev/null); then
        if echo "$headers" | grep -i "access-control-allow-origin" > /dev/null; then
            echo -e "${GREEN}✓ PASS${NC} (CORS enabled)"
            return 0
        else
            echo -e "${YELLOW}⚠ No CORS headers${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (connection error)"
        return 1
    fi
}

# Frontend validation
echo "📱 Frontend Validation:"
test_endpoint "$FRONTEND_URL" "Homepage accessibility"
test_endpoint "$FRONTEND_URL/static/css/main." "CSS assets" "200"
test_endpoint "$FRONTEND_URL/manifest.json" "PWA manifest"

echo ""

# Backend validation
echo "🤖 Backend Validation:"
echo "Waiting for HF Spaces to warm up..."
sleep 15

test_endpoint "$BACKEND_URL" "HF Spaces homepage"
test_json_endpoint "$BACKEND_URL/health" "Health endpoint" "status"
test_json_endpoint "$BACKEND_URL/api/v1/status" "Status endpoint" "status"
test_cors "$BACKEND_URL/health"

# API functionality tests
echo ""
echo "🔧 API Functionality Tests:"

# Test chat endpoint
echo -n "Testing chat API... "
if response=$(curl -s -X POST "$BACKEND_URL/api/v1/chat/message" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello"}' \
    -m $TIMEOUT 2>/dev/null); then
    if echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if 'response' in data else 1)" 2>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC} (Chat working)"
    else
        echo -e "${YELLOW}⚠ Invalid response format${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC} (API error)"
fi

# Test search endpoint
echo -n "Testing search API... "
if response=$(curl -s "$BACKEND_URL/api/v1/search?query=skills" -m $TIMEOUT 2>/dev/null); then
    if echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); exit(0 if 'results' in data else 1)" 2>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC} (Search working)"
    else
        echo -e "${YELLOW}⚠ Invalid response format${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC} (API error)"
fi

echo ""
echo "🏁 Validation Summary:"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""
echo "If any tests failed, check the deployment logs and retry deployment if necessary."