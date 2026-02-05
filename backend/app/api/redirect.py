from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services import url_service

router = APIRouter()


@router.get("/{slug}")
def redirect_to_url(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Redirect to the original URL and record analytics."""
    # Get the short URL from database
    short_url = url_service.get_url_by_slug(db, slug)
    if not short_url:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Get client info for analytics
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")
    
    # TODO: Add GeoIP lookup for country/city
    # For now, we'll leave these as None
    country = None
    city = None
    
    # Record the click
    url_service.record_click(
        db=db,
        short_url=short_url,
        ip_address=client_ip,
        user_agent_string=user_agent,
        referrer=referrer,
        country=country,
        city=city
    )
    
    # Redirect to original URL
    return RedirectResponse(url=short_url.original_url, status_code=307)
