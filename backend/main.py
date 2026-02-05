from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.redirect import router as redirect_router
from app.api.urls import router as urls_router
from app.core.config import settings
from app.db.base import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A production-ready URL shortener with analytics",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(urls_router, prefix=settings.API_V1_STR, tags=["urls"])

# Include redirect routes (at root level for short URLs)
app.include_router(redirect_router, tags=["redirect"])


@app.get("/")
def root():
    return {
        "message": "Welcome to Micro-URL API",
        "docs": "/docs",
        "version": "1.0.0"
    }
