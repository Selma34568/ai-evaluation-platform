from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.evaluations import router as evaluations_router
from app.api.datasets import router as datasets_router
from app.api.dashboard import router as dashboard_router


# Create FastAPI application

app = FastAPI(
    title="AI Evaluation Platform",
    description="Reusable evaluation platform for AI-powered applications.",
    version="0.1.0",
)


# CORS configuration

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers

app.include_router(evaluations_router)

app.include_router(datasets_router)

app.include_router(dashboard_router)


# Root endpoint

@app.get("/")
def root():
    return {
        "name": "AI Evaluation Platform",
        "version": "0.1.0",
        "status": "running",
        "documentation": "/docs",
    }


# Health check

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-evaluation-platform",
    }