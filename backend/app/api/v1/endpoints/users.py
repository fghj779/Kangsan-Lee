"""
User profile endpoints with comprehensive error handling
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import logging

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, decode_token
from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ValidationException,
    DatabaseException,
)
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.api.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile

    Args:
        current_user: Authenticated user

    Returns:
        UserResponse: User profile data
    """
    try:
        logger.info(f"Fetching profile for user: {current_user.id}")
        return UserResponse.model_validate(current_user)

    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise DatabaseException(
            "Failed to retrieve user profile",
            operation="get_profile"
        )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile with validation

    Args:
        user_update: Profile update data
        current_user: Authenticated user
        db: Database session

    Returns:
        UserResponse: Updated user profile

    Raises:
        ValidationException: If update data is invalid
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Updating profile for user: {current_user.id}")

        # Update fields if provided
        update_data = user_update.model_dump(exclude_unset=True)

        if not update_data:
            raise ValidationException(
                "No fields provided for update. Please provide at least one field to update."
            )

        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
            else:
                logger.warning(f"Attempt to update non-existent field: {field}")
                raise ValidationException(
                    f"Field '{field}' does not exist or cannot be updated",
                    field=field
                )

        try:
            await db.commit()
            await db.refresh(current_user)
            logger.info(f"Profile updated successfully for user: {current_user.id}")

        except Exception as e:
            await db.rollback()
            logger.error(f"Database error updating profile: {str(e)}")
            raise DatabaseException(
                "Failed to save profile changes. Please try again.",
                operation="update_profile"
            )

        return UserResponse.model_validate(current_user)

    except (ValidationException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating profile: {str(e)}")
        raise DatabaseException(
            "An unexpected error occurred while updating your profile",
            operation="update_profile"
        )


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password with validation

    Args:
        password_data: Current and new password
        current_user: Authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        AuthenticationException: If current password is incorrect
        ValidationException: If new password is invalid
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Password change request for user: {current_user.id}")

        # Verify current password
        try:
            if not verify_password(password_data.current_password, current_user.hashed_password):
                logger.warning(f"Invalid current password for user: {current_user.id}")
                raise AuthenticationException(
                    "Current password is incorrect. Please check and try again."
                )

        except AuthenticationException:
            raise
        except Exception as e:
            logger.error(f"Error verifying current password: {str(e)}")
            raise AuthenticationException(
                "Failed to verify current password"
            )

        # Hash new password
        try:
            new_hashed_password = get_password_hash(password_data.new_password)

        except Exception as e:
            logger.error(f"Error hashing new password: {str(e)}")
            raise AuthenticationException(
                "Failed to process new password"
            )

        # Update password
        try:
            current_user.hashed_password = new_hashed_password
            await db.commit()
            logger.info(f"Password changed successfully for user: {current_user.id}")

        except Exception as e:
            await db.rollback()
            logger.error(f"Database error changing password: {str(e)}")
            raise DatabaseException(
                "Failed to save new password. Please try again.",
                operation="change_password"
            )

        return {
            "success": True,
            "message": "Password changed successfully"
        }

    except (AuthenticationException, ValidationException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error changing password: {str(e)}")
        raise DatabaseException(
            "An unexpected error occurred while changing password",
            operation="change_password"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user profile by ID with error handling

    Args:
        user_id: User ID
        db: Database session

    Returns:
        UserResponse: User profile data

    Raises:
        ValidationException: If user_id is invalid
        NotFoundException: If user is not found
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Fetching user profile for ID: {user_id}")

        # Validate user_id
        if user_id <= 0:
            raise ValidationException(
                "Invalid user ID. User ID must be a positive integer.",
                field="user_id"
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
                operation="get_user"
            )

        if not user:
            logger.warning(f"User not found: {user_id}")
            raise NotFoundException("User", user_id)

        logger.info(f"User profile retrieved: {user_id}")
        return UserResponse.model_validate(user)

    except (ValidationException, NotFoundException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching user {user_id}: {str(e)}")
        raise DatabaseException(
            "An unexpected error occurred while retrieving user information",
            operation="get_user"
        )


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    List users with pagination and validation

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[UserResponse]: List of users

    Raises:
        ValidationException: If pagination parameters are invalid
        DatabaseException: If database operation fails
    """
    try:
        logger.info(f"Listing users: skip={skip}, limit={limit}")

        # Validate pagination parameters
        if skip < 0:
            raise ValidationException(
                "Skip parameter must be non-negative",
                field="skip"
            )

        if limit <= 0:
            raise ValidationException(
                "Limit parameter must be positive",
                field="limit"
            )

        if limit > 100:
            raise ValidationException(
                "Limit parameter cannot exceed 100",
                field="limit"
            )

        # Fetch users from database
        try:
            result = await db.execute(
                select(User)
                .where(User.is_active == True)
                .offset(skip)
                .limit(limit)
            )
            users = result.scalars().all()

        except Exception as e:
            logger.error(f"Database error listing users: {str(e)}")
            raise DatabaseException(
                "Failed to retrieve user list",
                operation="list_users"
            )

        logger.info(f"Retrieved {len(users)} users")
        return [UserResponse.model_validate(user) for user in users]

    except (ValidationException, DatabaseException):
        raise
    except Exception as e:
        logger.error(f"Unexpected error listing users: {str(e)}")
        raise DatabaseException(
            "An unexpected error occurred while retrieving users",
            operation="list_users"
        )
