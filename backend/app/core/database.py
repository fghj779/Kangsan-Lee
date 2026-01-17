"""
Database configuration with comprehensive error handling
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
import logging

from app.core.config import settings
from app.core.exceptions import DatabaseException

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy models
Base = declarative_base()


class DatabaseManager:
    """Manages database connections with error handling"""

    def __init__(self):
        self.engine = None
        self.async_session_maker = None

    def initialize(self) -> None:
        """
        Initialize database engine and session maker

        Raises:
            DatabaseException: If database initialization fails
        """
        try:
            database_url = settings.get_database_url()

            # Create async engine with proper pool settings
            self.engine = create_async_engine(
                database_url,
                echo=False,  # Set to True for SQL logging in development
                poolclass=NullPool,  # Use NullPool for better error handling
                pool_pre_ping=True,  # Verify connections before using
                connect_args={
                    "server_settings": {"application_name": settings.PROJECT_NAME}
                }
            )

            # Create async session maker
            self.async_session_maker = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False
            )

            logger.info("Database initialized successfully")

        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise DatabaseException(
                "Failed to initialize database connection. "
                "Please check your database configuration.",
                operation="initialization"
            )

    async def test_connection(self) -> bool:
        """
        Test database connection

        Returns:
            bool: True if connection is successful

        Raises:
            DatabaseException: If connection test fails
        """
        try:
            if not self.engine:
                raise DatabaseException(
                    "Database not initialized",
                    operation="connection_test"
                )

            async with self.engine.begin() as conn:
                await conn.execute("SELECT 1")

            logger.info("Database connection test successful")
            return True

        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            raise DatabaseException(
                "Failed to connect to database. "
                "Please ensure PostgreSQL is running and accessible.",
                operation="connection_test"
            )

    async def close(self) -> None:
        """
        Close database connections

        Raises:
            DatabaseException: If closing connections fails
        """
        try:
            if self.engine:
                await self.engine.dispose()
                logger.info("Database connections closed successfully")

        except Exception as e:
            logger.error(f"Error closing database connections: {str(e)}")
            raise DatabaseException(
                "Failed to close database connections",
                operation="close"
            )


# Global database manager instance
db_manager = DatabaseManager()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions with error handling

    Yields:
        AsyncSession: Database session

    Raises:
        DatabaseException: If session creation or cleanup fails
    """
    if not db_manager.async_session_maker:
        logger.error("Database not initialized - session maker is None")
        raise DatabaseException(
            "Database not initialized. Please start the application properly.",
            operation="get_session"
        )

    session = None
    try:
        # Create session
        session = db_manager.async_session_maker()
        logger.debug("Database session created")

        yield session

        # Commit if no exceptions occurred
        await session.commit()
        logger.debug("Database session committed successfully")

    except Exception as e:
        # Rollback on any error
        if session:
            await session.rollback()
            logger.warning(f"Database session rolled back due to error: {str(e)}")

        # Re-raise the exception
        if isinstance(e, DatabaseException):
            raise
        else:
            logger.error(f"Unexpected database error: {str(e)}")
            raise DatabaseException(
                f"Database operation failed: {str(e)}",
                operation="session"
            )

    finally:
        # Always close the session
        if session:
            await session.close()
            logger.debug("Database session closed")


async def init_db() -> None:
    """
    Initialize database tables

    Raises:
        DatabaseException: If table creation fails
    """
    try:
        # Import all models here to ensure they're registered
        from app.models import user, listing, board, message, reputation

        async with db_manager.engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)

        logger.info("Database tables created successfully")

    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise DatabaseException(
            "Failed to initialize database tables",
            operation="create_tables"
        )
