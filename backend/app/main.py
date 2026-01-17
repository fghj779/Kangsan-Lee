"""
Main FastAPI application with comprehensive error handling
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import db_manager, init_db
from app.core.exceptions import DatabaseException
from app.middleware.error_handler import register_exception_handlers
from app.api.v1.endpoints import auth, users, boards, listings, reputation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler with error handling

    Args:
        app: FastAPI application instance

    Raises:
        DatabaseException: If database initialization fails
    """
    # Startup
    try:
        logger.info("Starting application...")

        # Initialize database
        db_manager.initialize()
        logger.info("Database manager initialized")

        # Test database connection
        await db_manager.test_connection()
        logger.info("Database connection verified")

        # Create tables if they don't exist
        try:
            await init_db()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.warning(f"Table initialization skipped or failed: {str(e)}")

        logger.info("Application startup complete")

        yield

    except DatabaseException as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise

    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        raise

    finally:
        # Shutdown
        try:
            logger.info("Shutting down application...")
            await db_manager.close()
            logger.info("Database connections closed")
            logger.info("Application shutdown complete")

        except Exception as e:
            logger.error(f"Error during shutdown: {str(e)}")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A mobile-first community and marketplace app for football jersey collectors",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"],
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["Users"],
)

app.include_router(
    boards.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["Community"],
)

app.include_router(
    listings.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["Marketplace"],
)

app.include_router(
    reputation.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["Reputation"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Football Jersey Community API",
        "version": settings.VERSION,
        "docs": "/api/docs",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint with database connectivity test

    Returns:
        dict: Health status

    Raises:
        DatabaseException: If database is not accessible
    """
    try:
        # Test database connection
        await db_manager.test_connection()

        return {
            "status": "healthy",
            "database": "connected",
            "version": settings.VERSION,
        }

    except DatabaseException as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }

    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "unhealthy",
            "error": "Unexpected error during health check",
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
