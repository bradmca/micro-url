
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.url import URLCreate, URLListResponse, URLResponse, URLStats
from app.services import url_service

router = APIRouter()


@router.post("/shorten", response_model=URLResponse)
def create_short_url(
    url_data: URLCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new shortened URL."""
    try:
        base_url = str(request.base_url).rstrip("/")
        short_url = url_service.create_short_url(db, url_data, base_url)
        return URLResponse(
            id=short_url.id,
            original_url=short_url.original_url,
            slug=short_url.slug,
            short_url=f"{base_url}/{short_url.slug}",
            created_at=short_url.created_at,
            expires_at=short_url.expires_at,
            is_active=short_url.is_active,
            click_count=short_url.click_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/urls", response_model=URLListResponse)
def list_urls(
    request: Request,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db)
):
    """List all shortened URLs with pagination."""
    skip = (page - 1) * per_page
    urls, total = url_service.get_all_urls(db, skip=skip, limit=per_page)
    base_url = str(request.base_url).rstrip("/")
    
    return URLListResponse(
        urls=[
            URLResponse(
                id=url.id,
                original_url=url.original_url,
                slug=url.slug,
                short_url=f"{base_url}/{url.slug}",
                created_at=url.created_at,
                expires_at=url.expires_at,
                is_active=url.is_active,
                click_count=url.click_count
            )
            for url in urls
        ],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/stats/{slug}", response_model=URLStats)
def get_url_stats(slug: str, db: Session = Depends(get_db)):
    """Get analytics statistics for a shortened URL."""
    stats = url_service.get_url_stats(db, slug)
    if not stats:
        raise HTTPException(status_code=404, detail="URL not found")
    return stats


@router.delete("/urls/{slug}")
def delete_url(slug: str, db: Session = Depends(get_db)):
    """Delete a shortened URL."""
    success = url_service.delete_url(db, slug)
    if not success:
        raise HTTPException(status_code=404, detail="URL not found")
    return {"message": "URL deleted successfully"}


@router.get("/health")
def health_check():
    """Health check endpoint."""
    from app.services.redis_service import redis_service
    redis_ok = redis_service.health_check()
    return {
        "status": "healthy",
        "redis": "connected" if redis_ok else "disconnected"
    }
