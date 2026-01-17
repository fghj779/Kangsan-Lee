"""
Application configuration with comprehensive error handling
"""
from pydantic_settings import BaseSettings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with validation and error handling"""

    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Football Jersey Community"
    VERSION: str = "1.0.0"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "football_community"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:19006"]

    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_database_url(self) -> str:
        """
        Construct database URL with error handling

        Returns:
            str: PostgreSQL connection URL

        Raises:
            ValueError: If required database credentials are missing
        """
        try:
            if self.DATABASE_URL:
                return self.DATABASE_URL

            if not all([self.POSTGRES_SERVER, self.POSTGRES_USER,
                       self.POSTGRES_PASSWORD, self.POSTGRES_DB]):
                raise ValueError(
                    "Missing required database configuration. "
                    "Please set POSTGRES_SERVER, POSTGRES_USER, "
                    "POSTGRES_PASSWORD, and POSTGRES_DB."
                )

            url = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:"
                f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
            logger.info("Database URL constructed successfully")
            return url

        except Exception as e:
            logger.error(f"Error constructing database URL: {str(e)}")
            raise ValueError(f"Failed to construct database URL: {str(e)}")


# Global settings instance with error handling
try:
    settings = Settings()
    logger.info("Settings loaded successfully")
except Exception as e:
    logger.error(f"Failed to load settings: {str(e)}")
    raise RuntimeError(f"Application configuration failed: {str(e)}")
