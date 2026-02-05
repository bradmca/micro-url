from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ShortURL(Base):
    __tablename__ = "short_urls"
    
    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String(2048), nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    click_count = Column(Integer, default=0)
    
    # Relationships
    clicks = relationship("Click", back_populates="short_url", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ShortURL(slug={self.slug}, url={self.original_url[:50]}...)>"


class Click(Base):
    __tablename__ = "clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    short_url_id = Column(Integer, ForeignKey("short_urls.id"), nullable=False)
    clicked_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    user_agent = Column(String(512), nullable=True)
    referrer = Column(String(2048), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=True)  # desktop, mobile, tablet
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    
    # Relationships
    short_url = relationship("ShortURL", back_populates="clicks")
    
    def __repr__(self):
        return f"<Click(id={self.id}, country={self.country}, device={self.device_type})>"
