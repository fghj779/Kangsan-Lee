"""
Global error handling middleware
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
from typing import Union

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Handle custom application exceptions

    Args:
        request: FastAPI request object
        exc: Application exception

    Returns:
        JSONResponse: Formatted error response
    """
    logger.error(
        f"Application error: {exc.message} | "
        f"Status: {exc.status_code} | "
        f"Path: {request.url.path} | "
        f"Details: {exc.details}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "type": exc.__class__.__name__,
                "details": exc.details,
            },
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors with clear messages

    Args:
        request: FastAPI request object
        exc: Validation error

    Returns:
        JSONResponse: Formatted validation error response
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]

        # Make error messages more user-friendly
        if "field required" in message.lower():
            message = f"{field} is required"
        elif "extra forbidden" in message.lower():
            message = f"{field} is not allowed"
        elif "type_error" in error.get("type", ""):
            message = f"{field} has an invalid format"

        errors.append({
            "field": field,
            "message": message,
            "type": error["type"],
        })

    logger.warning(
        f"Validation error: {request.url.path} | "
        f"Errors: {errors}"
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "message": "Validation failed. Please check your input and try again.",
                "type": "ValidationError",
                "details": {"errors": errors},
            },
        },
    )


async def database_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """
    Handle database errors with appropriate messages

    Args:
        request: FastAPI request object
        exc: SQLAlchemy error

    Returns:
        JSONResponse: Formatted database error response
    """
    logger.error(
        f"Database error: {str(exc)} | "
        f"Path: {request.url.path}",
        exc_info=True
    )

    # Don't expose internal database errors to users
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "A database error occurred. Please try again later.",
                "type": "DatabaseError",
                "details": {},
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all other unexpected exceptions

    Args:
        request: FastAPI request object
        exc: Any exception

    Returns:
        JSONResponse: Formatted error response
    """
    logger.error(
        f"Unexpected error: {str(exc)} | "
        f"Type: {type(exc).__name__} | "
        f"Path: {request.url.path}",
        exc_info=True
    )

    # Don't expose internal error details to users
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": "An unexpected error occurred. Please try again later.",
                "type": "InternalServerError",
                "details": {},
            },
        },
    )


def register_exception_handlers(app) -> None:
    """
    Register all exception handlers with the FastAPI app

    Args:
        app: FastAPI application instance
    """
    # Custom application exceptions
    app.add_exception_handler(AppException, app_exception_handler)

    # Validation errors
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # Database errors
    app.add_exception_handler(SQLAlchemyError, database_exception_handler)

    # Catch-all for unexpected errors
    app.add_exception_handler(Exception, generic_exception_handler)

    logger.info("Exception handlers registered successfully")
