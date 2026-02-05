from collections.abc import Generator

from app.db.base import SessionLocal


def get_db() -> Generator:
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
