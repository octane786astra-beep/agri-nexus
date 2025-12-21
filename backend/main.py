"""
Agri-Nexus: AI-Integrated Digital Twin Platform
===============================================
FastAPI Backend Server

This is the main entry point for the Agri-Nexus backend API.
It handles:
- Real-time sensor simulation via WebSockets
- AI-powered geo-intelligence analysis
- Crop recommendation engine
- Weather prediction models
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("agri-nexus")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    logger.info("🌱 Agri-Nexus Backend Starting...")
    logger.info("🔬 Initializing Digital Twin Simulation Engine...")
    logger.info("🤖 Loading AI Models...")
    yield
    # Shutdown
    logger.info("🛑 Agri-Nexus Backend Shutting Down...")


# Initialize FastAPI application
app = FastAPI(
    title="Agri-Nexus API",
    description="AI-Integrated Digital Twin Platform for Precision Farming",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS Configuration - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Next.js dev server
        "http://127.0.0.1:3000",
        "https://*.vercel.app",       # Vercel deployments
        "https://*.onrender.com",     # Render.com deployments
        "https://agri-nexus-frontend.onrender.com",  # Specific frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Health Check Endpoint
# ============================================
@app.get("/api/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify API is running.
    
    Returns:
        dict: Status information including version and simulation state
    """
    return {
        "status": "healthy",
        "service": "agri-nexus-api",
        "version": "1.0.0",
        "simulation": "standby",
        "ai_agent": "ready",
        "message": "🌱 Agri-Nexus Digital Twin is operational"
    }


# ============================================
# Test Endpoint (Prompt 10 - API Connectivity)
# ============================================
@app.get("/api/v1/test", tags=["System"])
async def test_endpoint():
    """
    Test endpoint to verify frontend-backend connectivity.
    
    Returns:
        dict: Test message with timestamp
    """
    from datetime import datetime
    return {
        "success": True,
        "message": "Frontend-Backend connection established!",
        "timestamp": datetime.now().isoformat(),
        "endpoints_available": [
            "/api/health",
            "/api/v1/test",
            "/ws/sensors/{farm_id}",
            "/api/research/full-scan"
        ]
    }


# ============================================
# Root Redirect
# ============================================
@app.get("/", tags=["System"])
async def root():
    """Redirect to API documentation."""
    return {
        "message": "Welcome to Agri-Nexus API",
        "docs": "/api/docs",
        "health": "/api/health"
    }


# Import and include routers
from app.routers import sensors, simulation, research
# from app.routers import geo  # To be added

# Include routers
app.include_router(sensors.router, tags=["Sensors"])
app.include_router(simulation.router, prefix="/api/sim", tags=["Simulation"])
app.include_router(research.router, prefix="/api", tags=["Research"])
# app.include_router(geo.router, prefix="/api/geo", tags=["Geo-Intelligence"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
