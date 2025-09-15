from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Optional
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
import json

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to protect API endpoints"""
    
    def __init__(self, app, requests_per_window: int = 100, window_seconds: int = 3600):
        super().__init__(app)
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.client_requests: Dict[str, deque] = defaultdict(deque)
        self.cleanup_interval = 300  # Clean up every 5 minutes
        self.last_cleanup = time.time()
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        # Check for forwarded headers first (common in cloud deployments)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        return request.client.host if request.client else "unknown"
    
    def cleanup_old_requests(self):
        """Remove old request timestamps to prevent memory leaks"""
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
            
        cutoff_time = current_time - self.window_seconds
        
        for client_ip in list(self.client_requests.keys()):
            timestamps = self.client_requests[client_ip]
            
            # Remove old timestamps
            while timestamps and timestamps[0] < cutoff_time:
                timestamps.popleft()
            
            # Remove empty deques
            if not timestamps:
                del self.client_requests[client_ip]
        
        self.last_cleanup = current_time
    
    async def dispatch(self, request: Request, call_next):
        """Process rate limiting for incoming requests"""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/docs", "/openapi.json", "/"]:
            response = await call_next(request)
            return response
        
        client_ip = self.get_client_ip(request)
        current_time = time.time()
        
        # Cleanup old requests periodically
        self.cleanup_old_requests()
        
        # Get request timestamps for this client
        timestamps = self.client_requests[client_ip]
        
        # Remove timestamps outside the current window
        cutoff_time = current_time - self.window_seconds
        while timestamps and timestamps[0] < cutoff_time:
            timestamps.popleft()
        
        # Check if client has exceeded rate limit
        if len(timestamps) >= self.requests_per_window:
            error_response = {
                "error": {
                    "type": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded. Maximum {self.requests_per_window} requests per {self.window_seconds} seconds.",
                    "details": {
                        "requests_made": len(timestamps),
                        "window_seconds": self.window_seconds,
                        "reset_time": int(timestamps[0] + self.window_seconds)
                    }
                },
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            return JSONResponse(
                status_code=429,
                content=error_response,
                headers={
                    "X-RateLimit-Limit": str(self.requests_per_window),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(timestamps[0] + self.window_seconds)),
                    "Retry-After": str(int(timestamps[0] + self.window_seconds - current_time))
                }
            )
        
        # Add current request timestamp
        timestamps.append(current_time)
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to response
        remaining = max(0, self.requests_per_window - len(timestamps))
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_window)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        
        if timestamps:
            response.headers["X-RateLimit-Reset"] = str(int(timestamps[0] + self.window_seconds))
        
        return response

def create_error_response(error_type: str, message: str, status_code: int = 400, details: Optional[Dict] = None) -> JSONResponse:
    """Create standardized error response"""
    error_content = {
        "error": {
            "type": error_type,
            "message": message,
            "details": details or {}
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    return JSONResponse(
        status_code=status_code,
        content=error_content
    )