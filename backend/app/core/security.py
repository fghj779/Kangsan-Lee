"""
Security utilities with comprehensive error handling
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

from app.core.config import settings
from app.core.exceptions import AuthenticationException

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database

    Returns:
        bool: True if password matches, False otherwise

    Raises:
        AuthenticationException: If password verification fails unexpectedly
    """
    try:
        if not plain_password or not hashed_password:
            logger.warning("Empty password provided for verification")
            return False

        is_valid = pwd_context.verify(plain_password, hashed_password)
        return is_valid

    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        raise AuthenticationException(
            "Password verification failed. Please try again."
        )


def get_password_hash(password: str) -> str:
    """
    Hash a password for storing

    Args:
        password: Plain text password

    Returns:
        str: Hashed password

    Raises:
        AuthenticationException: If password hashing fails
    """
    try:
        if not password:
            raise AuthenticationException("Password cannot be empty")

        if len(password) < 8:
            raise AuthenticationException(
                "Password must be at least 8 characters long"
            )

        hashed = pwd_context.hash(password)
        logger.debug("Password hashed successfully")
        return hashed

    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Password hashing error: {str(e)}")
        raise AuthenticationException(
            "Failed to hash password. Please try again."
        )


def create_access_token(
    subject: Union[str, int],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token

    Args:
        subject: User ID or username
        expires_delta: Token expiration time

    Returns:
        str: Encoded JWT token

    Raises:
        AuthenticationException: If token creation fails
    """
    try:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

        to_encode = {
            "exp": expire,
            "sub": str(subject),
            "type": "access"
        }

        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        logger.debug(f"Access token created for subject: {subject}")
        return encoded_jwt

    except Exception as e:
        logger.error(f"Token creation error: {str(e)}")
        raise AuthenticationException(
            "Failed to create authentication token"
        )


def create_refresh_token(subject: Union[str, int]) -> str:
    """
    Create a JWT refresh token

    Args:
        subject: User ID or username

    Returns:
        str: Encoded JWT refresh token

    Raises:
        AuthenticationException: If token creation fails
    """
    try:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        to_encode = {
            "exp": expire,
            "sub": str(subject),
            "type": "refresh"
        }

        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        logger.debug(f"Refresh token created for subject: {subject}")
        return encoded_jwt

    except Exception as e:
        logger.error(f"Refresh token creation error: {str(e)}")
        raise AuthenticationException(
            "Failed to create refresh token"
        )


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token payload

    Raises:
        AuthenticationException: If token is invalid or expired
    """
    try:
        if not token:
            raise AuthenticationException("No authentication token provided")

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        if not payload.get("sub"):
            raise AuthenticationException("Invalid token: missing subject")

        logger.debug("Token decoded successfully")
        return payload

    except JWTError as e:
        logger.warning(f"JWT decode error: {str(e)}")
        if "expired" in str(e).lower():
            raise AuthenticationException(
                "Authentication token has expired. Please log in again."
            )
        else:
            raise AuthenticationException(
                "Invalid authentication token. Please log in again."
            )

    except Exception as e:
        logger.error(f"Token decode error: {str(e)}")
        raise AuthenticationException(
            "Failed to validate authentication token"
        )


def validate_token_type(payload: dict, expected_type: str) -> None:
    """
    Validate that a token is of the expected type

    Args:
        payload: Decoded token payload
        expected_type: Expected token type (access or refresh)

    Raises:
        AuthenticationException: If token type doesn't match
    """
    token_type = payload.get("type")

    if token_type != expected_type:
        logger.warning(
            f"Token type mismatch: expected {expected_type}, got {token_type}"
        )
        raise AuthenticationException(
            f"Invalid token type. Expected {expected_type} token."
        )
