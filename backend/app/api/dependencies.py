"""
API dependencies with comprehensive error handling
"""
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import logging

from app.core.database import get_db
from app.core.security import decode_token, validate_token_type
from app.core.exceptions import (
    AuthenticationException,
    NotFoundException,
    DatabaseException,
)
from app.models.user import User

logger = logging.getLogger(__name__)


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token

    Args:
        authorization: Authorization header with Bearer token
        db: Database session

    Returns:
        User: Authenticated user object

    Raises:
        AuthenticationException: If token is invalid or missing
        NotFoundException: If user is not found
        DatabaseException: If database operation fails
    """
    try:
        # Check if authorization header is present
        if not authorization:
            logger.warning("Missing authorization header")
            raise AuthenticationException(
                "Authentication required. Please provide a valid access token."
            )

        # Extract token from header
        try:
            scheme, token = authorization.split()

            if scheme.lower() != "bearer":
                logger.warning(f"Invalid authentication scheme: {scheme}")
                raise AuthenticationException(
                    "Invalid authentication scheme. Use 'Bearer <token>'."
                )

            if not token:
                logger.warning("Empty token in authorization header")
                raise AuthenticationException(
                    "Empty authentication token. Please provide a valid token."
                )

        except ValueError:
            logger.warning(f"Malformed authorization header: {authorization}")
            raise AuthenticationException(
                "Malformed authorization header. Format should be 'Bearer <token>'."
            )

        # Decode and validate token
        try:
            payload = decode_token(token)
            validate_token_type(payload, "access")
            user_id = int(payload.get("sub"))

            logger.debug(f"Token decoded for user ID: {user_id}")

        except AuthenticationException:
            raise
        except ValueError as e:
            logger.error(f"Invalid user ID in token: {str(e)}")
            raise AuthenticationException(
                "Invalid token payload. Please log in again."
            )
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            raise AuthenticationException(
                "Failed to validate authentication token"
            )

        # Fetch user from database
        try:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()

        except Exception as e:
            logger.error(f"Database error fetching user {user_id}: {str(e)}")
            raise DatabaseException(
                "Failed to retrieve user information",
                operation="get_current_user"
            )

        # Check if user exists
        if not user:
            logger.warning(f"User not found for ID in token: {user_id}")
            raise NotFoundException("User", user_id)

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Inactive user attempted access: {user_id}")
            raise AuthenticationException(
                "Your account has been deactivated. Please contact support."
            )

        logger.debug(f"User authenticated successfully: {user.id} - {user.username}")
        return user

    except (AuthenticationException, NotFoundException, DatabaseException):
        # Re-raise application exceptions
        raise

    except Exception as e:
        logger.error(f"Unexpected error in authentication: {str(e)}")
        raise AuthenticationException(
            "An unexpected error occurred during authentication"
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (additional check)

    Args:
        current_user: Current user from get_current_user

    Returns:
        User: Active user object

    Raises:
        AuthenticationException: If user is not active
    """
    if not current_user.is_active:
        logger.warning(f"Inactive user access attempt: {current_user.id}")
        raise AuthenticationException(
            "Your account is not active. Please contact support."
        )

    return current_user


async def require_moderator(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require user to have moderator or admin role

    Args:
        current_user: Current authenticated user

    Returns:
        User: User with moderator privileges

    Raises:
        AuthenticationException: If user is not a moderator or admin
    """
    from app.models.user import UserRole

    if current_user.role not in [UserRole.MODERATOR, UserRole.ADMIN]:
        logger.warning(
            f"Unauthorized moderator access attempt by user: {current_user.id}"
        )
        raise AuthenticationException(
            "This action requires moderator privileges"
        )

    logger.debug(f"Moderator access granted: {current_user.id}")
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require user to have admin role

    Args:
        current_user: Current authenticated user

    Returns:
        User: User with admin privileges

    Raises:
        AuthenticationException: If user is not an admin
    """
    from app.models.user import UserRole

    if current_user.role != UserRole.ADMIN:
        logger.warning(
            f"Unauthorized admin access attempt by user: {current_user.id}"
        )
        raise AuthenticationException(
            "This action requires administrator privileges"
        )

    logger.debug(f"Admin access granted: {current_user.id}")
    return current_user
