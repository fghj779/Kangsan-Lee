"""
Authentication endpoints with comprehensive error handling
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import logging

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_token_type,
)
from app.core.exceptions import (
    AuthenticationException,
    ValidationException,
    ConflictException,
    DatabaseException,
)
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with comprehensive error handling

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        TokenResponse: Access token, refresh token, and user data

    Raises:
        ValidationException: If input data is invalid
        ConflictException: If email or username already exists
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")

        # Check if email already exists
        try:
            result = await db.execute(
                select(User).where(User.email == user_data.email)
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                logger.warning(f"Registration failed: Email already exists - {user_data.email}")
                raise ConflictException(
                    "An account with this email already exists. Please use a different email or try logging in.",
                    resource="user"
                )

        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Database error checking email: {str(e)}")
            raise DatabaseException(
                "Failed to verify email availability",
                operation="check_email"
            )

        # Check if username already exists
        try:
            result = await db.execute(
                select(User).where(User.username == user_data.username.lower())
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                logger.warning(f"Registration failed: Username already exists - {user_data.username}")
                raise ConflictException(
                    "This username is already taken. Please choose a different username.",
                    resource="username"
                )

        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Database error checking username: {str(e)}")
            raise DatabaseException(
                "Failed to verify username availability",
                operation="check_username"
            )

        # Hash password
        try:
            hashed_password = get_password_hash(user_data.password)
        except AuthenticationException:
            raise
        except Exception as e:
            logger.error(f"Password hashing failed: {str(e)}")
            raise AuthenticationException("Failed to process password")

        # Create new user
        try:
            new_user = User(
                email=user_data.email,
                username=user_data.username.lower(),
                hashed_password=hashed_password,
                full_name=user_data.full_name,
            )

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            logger.info(f"User created successfully: {new_user.id} - {new_user.username}")

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to create user: {str(e)}")
            raise DatabaseException(
                "Failed to create user account. Please try again.",
                operation="create_user"
            )

        # Generate tokens
        try:
            access_token = create_access_token(subject=new_user.id)
            refresh_token = create_refresh_token(subject=new_user.id)

            # Update last login
            new_user.last_login = datetime.utcnow()
            await db.commit()

            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user=UserResponse.model_validate(new_user)
            )

        except Exception as e:
            logger.error(f"Token generation failed: {str(e)}")
            raise AuthenticationException("Failed to generate authentication tokens")

    except (ValidationException, ConflictException, AuthenticationException, DatabaseException):
        # Re-raise application exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration. Please try again later."
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return tokens

    Args:
        credentials: Login credentials
        db: Database session

    Returns:
        TokenResponse: Access token, refresh token, and user data

    Raises:
        AuthenticationException: If credentials are invalid
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Login attempt for email: {credentials.email}")

        # Find user by email
        try:
            result = await db.execute(
                select(User).where(User.email == credentials.email)
            )
            user = result.scalar_one_or_none()

        except Exception as e:
            logger.error(f"Database error during login: {str(e)}")
            raise DatabaseException(
                "Failed to retrieve user information",
                operation="login"
            )

        # Verify user exists and password is correct
        if not user:
            logger.warning(f"Login failed: User not found - {credentials.email}")
            raise AuthenticationException(
                "Invalid email or password. Please check your credentials and try again."
            )

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login failed: User account is inactive - {credentials.email}")
            raise AuthenticationException(
                "Your account has been deactivated. Please contact support for assistance."
            )

        # Verify password
        try:
            password_valid = verify_password(credentials.password, user.hashed_password)

            if not password_valid:
                logger.warning(f"Login failed: Invalid password - {credentials.email}")
                raise AuthenticationException(
                    "Invalid email or password. Please check your credentials and try again."
                )

        except AuthenticationException:
            raise
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            raise AuthenticationException("Failed to verify password")

        # Generate tokens
        try:
            access_token = create_access_token(subject=user.id)
            refresh_token = create_refresh_token(subject=user.id)

            # Update last login
            user.last_login = datetime.utcnow()
            await db.commit()

            logger.info(f"Login successful: {user.id} - {user.username}")

            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user=UserResponse.model_validate(user)
            )

        except Exception as e:
            logger.error(f"Token generation failed during login: {str(e)}")
            raise AuthenticationException("Failed to generate authentication tokens")

    except (AuthenticationException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login. Please try again later."
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token

    Args:
        refresh_token: Refresh token
        db: Database session

    Returns:
        TokenResponse: New access token and user data

    Raises:
        AuthenticationException: If refresh token is invalid
        DatabaseException: If database operation fails
    """
    try:
        logger.info("Token refresh attempt")

        # Decode and validate refresh token
        try:
            payload = decode_token(refresh_token)
            validate_token_type(payload, "refresh")
            user_id = int(payload.get("sub"))

        except AuthenticationException:
            raise
        except Exception as e:
            logger.error(f"Invalid refresh token: {str(e)}")
            raise AuthenticationException("Invalid refresh token")

        # Get user from database
        try:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()

        except Exception as e:
            logger.error(f"Database error during token refresh: {str(e)}")
            raise DatabaseException(
                "Failed to retrieve user information",
                operation="refresh_token"
            )

        if not user:
            logger.warning(f"Token refresh failed: User not found - {user_id}")
            raise AuthenticationException("User not found. Please log in again.")

        if not user.is_active:
            logger.warning(f"Token refresh failed: User inactive - {user_id}")
            raise AuthenticationException("Account is inactive")

        # Generate new tokens
        try:
            new_access_token = create_access_token(subject=user.id)
            new_refresh_token = create_refresh_token(subject=user.id)

            logger.info(f"Token refresh successful: {user.id}")

            return TokenResponse(
                access_token=new_access_token,
                refresh_token=new_refresh_token,
                user=UserResponse.model_validate(user)
            )

        except Exception as e:
            logger.error(f"Failed to generate new tokens: {str(e)}")
            raise AuthenticationException("Failed to generate new tokens")

    except (AuthenticationException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please log in again."
        )
