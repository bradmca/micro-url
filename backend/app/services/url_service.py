import secrets
import string
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session
from user_agents import parse

from app.models.url import Click, ShortURL
from app.schemas.url import URLCreate, URLStats
from app.services.redis_service import redis_service


def generate_slug(length: int = 7) -> str:
    """Generate a random URL-safe slug."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def create_short_url(db: Session, url_data: URLCreate, base_url: str) -> ShortURL:
    """Create a new shortened URL."""
    # Use custom slug or generate one
    slug = url_data.custom_slug
    if not slug:
        # Generate unique slug
        while True:
            slug = generate_slug()
            if not db.query(ShortURL).filter(ShortURL.slug == slug).first():
                break
    
    # Check if custom slug already exists
    if url_data.custom_slug:
        existing = db.query(ShortURL).filter(ShortURL.slug == slug).first()
        if existing:
            raise ValueError(f"Slug '{slug}' is already in use")
    
    short_url = ShortURL(
        original_url=str(url_data.original_url),
        slug=slug,
        expires_at=url_data.expires_at
    )
    db.add(short_url)
    db.commit()
    db.refresh(short_url)
    
    # Cache in Redis
    redis_service.set_url(slug, str(url_data.original_url))
    
    return short_url


def get_url_by_slug(db: Session, slug: str) -> ShortURL | None:
    """Get a short URL by its slug."""
    return db.query(ShortURL).filter(
        ShortURL.slug == slug,
        ShortURL.is_active
    ).first()


def get_original_url(db: Session, slug: str) -> str | None:
    """Get original URL, checking cache first."""
    # Try cache first
    cached_url = redis_service.get_url(slug)
    if cached_url:
        return cached_url
    
    # Fall back to database
    short_url = get_url_by_slug(db, slug)
    if short_url:
        # Check expiration
        if short_url.expires_at and short_url.expires_at < datetime.utcnow():
            return None
        # Cache for next time
        redis_service.set_url(slug, short_url.original_url)
        return short_url.original_url
    
    return None


def record_click(
    db: Session,
    short_url: ShortURL,
    ip_address: str | None = None,
    user_agent_string: str | None = None,
    referrer: str | None = None,
    country: str | None = None,
    city: str | None = None
) -> Click:
    """Record a click event with analytics data."""
    # Parse user agent
    device_type = None
    browser = None
    os = None
    
    if user_agent_string:
        ua = parse(user_agent_string)
        if ua.is_mobile:
            device_type = "mobile"
        elif ua.is_tablet:
            device_type = "tablet"
        elif ua.is_pc:
            device_type = "desktop"
        else:
            device_type = "other"
        
        browser = f"{ua.browser.family} {ua.browser.version_string}"
        os = f"{ua.os.family} {ua.os.version_string}"
    
    click = Click(
        short_url_id=short_url.id,
        ip_address=ip_address,
        user_agent=user_agent_string,
        referrer=referrer,
        country=country,
        city=city,
        device_type=device_type,
        browser=browser,
        os=os
    )
    db.add(click)
    
    # Update click count
    short_url.click_count += 1
    db.commit()
    
    # Update Redis counter
    redis_service.increment_click(short_url.slug)
    
    return click


def get_url_stats(db: Session, slug: str) -> URLStats | None:
    """Get analytics statistics for a URL."""
    short_url = db.query(ShortURL).filter(ShortURL.slug == slug).first()
    if not short_url:
        return None
    
    clicks = db.query(Click).filter(Click.short_url_id == short_url.id).all()
    
    # Aggregate by country
    clicks_by_country = {}
    for click in clicks:
        country = click.country or "Unknown"
        clicks_by_country[country] = clicks_by_country.get(country, 0) + 1
    
    # Aggregate by device
    clicks_by_device = {}
    for click in clicks:
        device = click.device_type or "Unknown"
        clicks_by_device[device] = clicks_by_device.get(device, 0) + 1
    
    # Aggregate by browser
    clicks_by_browser = {}
    for click in clicks:
        browser = click.browser or "Unknown"
        clicks_by_browser[browser] = clicks_by_browser.get(browser, 0) + 1
    
    # Aggregate by OS
    clicks_by_os = {}
    for click in clicks:
        os = click.os or "Unknown"
        clicks_by_os[os] = clicks_by_os.get(os, 0) + 1
    
    # Clicks over time (by day)
    clicks_over_time = db.query(
        func.date(Click.clicked_at).label('date'),
        func.count(Click.id).label('count')
    ).filter(
        Click.short_url_id == short_url.id
    ).group_by(
        func.date(Click.clicked_at)
    ).order_by(
        func.date(Click.clicked_at)
    ).all()
    
    # Top referrers
    top_referrers = db.query(
        Click.referrer,
        func.count(Click.id).label('count')
    ).filter(
        Click.short_url_id == short_url.id,
        Click.referrer.isnot(None)
    ).group_by(
        Click.referrer
    ).order_by(
        func.count(Click.id).desc()
    ).limit(10).all()
    
    return URLStats(
        slug=slug,
        original_url=short_url.original_url,
        total_clicks=short_url.click_count,
        clicks_by_country=clicks_by_country,
        clicks_by_device=clicks_by_device,
        clicks_by_browser=clicks_by_browser,
        clicks_by_os=clicks_by_os,
        clicks_over_time=[{"date": str(r.date), "count": r.count} for r in clicks_over_time],
        top_referrers=[{"referrer": r.referrer, "count": r.count} for r in top_referrers]
    )


def get_all_urls(db: Session, skip: int = 0, limit: int = 50) -> tuple[list[ShortURL], int]:
    """Get all URLs with pagination."""
    total = db.query(func.count(ShortURL.id)).scalar()
    urls = db.query(ShortURL).order_by(ShortURL.created_at.desc()).offset(skip).limit(limit).all()
    return urls, total


def delete_url(db: Session, slug: str) -> bool:
    """Delete a short URL."""
    short_url = db.query(ShortURL).filter(ShortURL.slug == slug).first()
    if not short_url:
        return False
    
    db.delete(short_url)
    db.commit()
    
    # Remove from cache
    redis_service.delete_url(slug)
    
    return True
