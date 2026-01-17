"""
Custom exceptions with detailed error messages
"""
from typing import Any, Optional


class AppException(Exception):
    """Base exception class for all application errors"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(AppException):
    """Raised when data validation fails"""

    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(message, status_code=400, details=details)


class AuthenticationException(AppException):
    """Raised when authentication fails"""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationException(AppException):
    """Raised when user lacks required permissions"""

    def __init__(self, message: str = "You don't have permission to perform this action"):
        super().__init__(message, status_code=403)


class NotFoundException(AppException):
    """Raised when a resource is not found"""

    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(message, status_code=404, details={"resource": resource, "identifier": str(identifier)})


class ConflictException(AppException):
    """Raised when there's a conflict with existing data"""

    def __init__(self, message: str, resource: Optional[str] = None):
        details = {"resource": resource} if resource else {}
        super().__init__(message, status_code=409, details=details)


class DatabaseException(AppException):
    """Raised when database operations fail"""

    def __init__(self, message: str, operation: Optional[str] = None):
        details = {"operation": operation} if operation else {}
        super().__init__(
            f"Database error: {message}",
            status_code=500,
            details=details
        )


class FileUploadException(AppException):
    """Raised when file upload fails"""

    def __init__(self, message: str, filename: Optional[str] = None):
        details = {"filename": filename} if filename else {}
        super().__init__(message, status_code=400, details=details)


class RateLimitException(AppException):
    """Raised when rate limit is exceeded"""

    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(message, status_code=429)


class ExternalServiceException(AppException):
    """Raised when external service calls fail"""

    def __init__(self, service: str, message: str):
        super().__init__(
            f"External service error ({service}): {message}",
            status_code=502,
            details={"service": service}
        )
