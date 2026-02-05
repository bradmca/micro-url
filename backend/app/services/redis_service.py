
import redis

from app.core.config import settings


class RedisService:
    def __init__(self):
        self._client: redis.Redis | None = None
    
    @property
    def client(self) -> redis.Redis:
        if self._client is None:
            self._client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                decode_responses=True
            )
        return self._client
    
    def get_url(self, slug: str) -> str | None:
        """Get the original URL for a slug from cache."""
        return self.client.get(f"url:{slug}")
    
    def set_url(self, slug: str, original_url: str, ttl: int = 3600) -> None:
        """Cache a slug -> URL mapping with TTL (default 1 hour)."""
        self.client.setex(f"url:{slug}", ttl, original_url)
    
    def delete_url(self, slug: str) -> None:
        """Remove a cached URL."""
        self.client.delete(f"url:{slug}")
    
    def increment_click(self, slug: str) -> int:
        """Increment click count for a slug and return new count."""
        return self.client.incr(f"clicks:{slug}")
    
    def get_click_count(self, slug: str) -> int:
        """Get cached click count for a slug."""
        count = self.client.get(f"clicks:{slug}")
        return int(count) if count else 0
    
    def health_check(self) -> bool:
        """Check if Redis is accessible."""
        try:
            return self.client.ping()
        except redis.ConnectionError:
            return False


# Singleton instance
redis_service = RedisService()
