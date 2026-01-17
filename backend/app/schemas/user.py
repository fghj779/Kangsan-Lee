"""
User schemas with comprehensive validation
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re

from app.models.user import UserRole
from app.core.exceptions import ValidationException


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """
        Validate username format

        Args:
            v: Username string

        Returns:
            str: Validated username

        Raises:
            ValidationException: If username format is invalid
        """
        if not v:
            raise ValidationException("Username cannot be empty", field="username")

        # Only alphanumeric and underscores allowed
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValidationException(
                "Username can only contain letters, numbers, and underscores",
                field="username"
            )

        # Cannot start with underscore
        if v.startswith("_"):
            raise ValidationException(
                "Username cannot start with an underscore",
                field="username"
            )

        return v.lower()


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """
        Validate password strength

        Args:
            v: Password string

        Returns:
            str: Validated password

        Raises:
            ValidationException: If password doesn't meet requirements
        """
        if not v:
            raise ValidationException("Password cannot be empty", field="password")

        if len(v) < 8:
            raise ValidationException(
                "Password must be at least 8 characters long",
                field="password"
            )

        # Check for at least one letter
        if not re.search(r"[a-zA-Z]", v):
            raise ValidationException(
                "Password must contain at least one letter",
                field="password"
            )

        # Check for at least one number
        if not re.search(r"\d", v):
            raise ValidationException(
                "Password must contain at least one number",
                field="password"
            )

        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio length"""
        if v and len(v) > 1000:
            raise ValidationException(
                "Bio cannot exceed 1000 characters",
                field="bio"
            )
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator("password")
    @classmethod
    def validate_password_not_empty(cls, v: str) -> str:
        """Ensure password is not empty"""
        if not v or not v.strip():
            raise ValidationException("Password cannot be empty", field="password")
        return v


class UserResponse(BaseModel):
    """Schema for user response"""
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    contribution_score: int
    total_posts: int
    total_verifications: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordChange(BaseModel):
    """Schema for password change"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str, info) -> str:
        """
        Validate new password strength and ensure it's different

        Args:
            v: New password string
            info: Validation info

        Returns:
            str: Validated password

        Raises:
            ValidationException: If password is invalid or same as current
        """
        # Check password strength
        if len(v) < 8:
            raise ValidationException(
                "Password must be at least 8 characters long",
                field="new_password"
            )

        if not re.search(r"[a-zA-Z]", v):
            raise ValidationException(
                "Password must contain at least one letter",
                field="new_password"
            )

        if not re.search(r"\d", v):
            raise ValidationException(
                "Password must contain at least one number",
                field="new_password"
            )

        # Ensure new password is different from current
        current_password = info.data.get("current_password")
        if current_password and v == current_password:
            raise ValidationException(
                "New password must be different from current password",
                field="new_password"
            )

        return v
