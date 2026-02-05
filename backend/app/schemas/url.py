import re
from datetime import datetime

from pydantic import BaseModel, HttpUrl, field_validator


class URLCreate(BaseModel):
    original_url: HttpUrl
    custom_slug: str | None = None
    expires_at: datetime | None = None
    
    @field_validator('custom_slug')
    @classmethod
    def validate_slug(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Slug can only contain letters, numbers, underscores, and hyphens')
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Slug must be between 3 and 50 characters')
        return v


class URLResponse(BaseModel):
    id: int
    original_url: str
    slug: str
    short_url: str
    created_at: datetime
    expires_at: datetime | None = None
    is_active: bool
    click_count: int
    
    class Config:
        from_attributes = True


class URLStats(BaseModel):
    slug: str
    original_url: str
    total_clicks: int
    clicks_by_country: dict
    clicks_by_device: dict
    clicks_by_browser: dict
    clicks_by_os: dict
    clicks_over_time: list
    top_referrers: list


class ClickResponse(BaseModel):
    id: int
    clicked_at: datetime
    country: str | None = None
    city: str | None = None
    device_type: str | None = None
    browser: str | None = None
    os: str | None = None
    referrer: str | None = None
    
    class Config:
        from_attributes = True


class URLListResponse(BaseModel):
    urls: list[URLResponse]
    total: int
    page: int
    per_page: int
