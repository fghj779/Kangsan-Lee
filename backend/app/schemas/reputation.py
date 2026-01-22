"""
Pydantic schemas for reputation system
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# Reputation Schemas
class ReputationBase(BaseModel):
    """Base schema for reputation feedback"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    feedback_text: str = Field(..., min_length=10, max_length=1000, description="Detailed feedback")
    transaction_id: int = Field(..., gt=0, description="Related transaction ID")

    @field_validator("feedback_text")
    @classmethod
    def validate_feedback(cls, v: str) -> str:
        """Ensure feedback is constructive"""
        if len(v.strip()) < 10:
            raise ValueError("Feedback must be at least 10 characters")
        return v.strip()


class ReputationCreate(ReputationBase):
    """Schema for creating reputation feedback"""
    reviewed_user_id: int = Field(..., gt=0, description="User being reviewed")


class ReputationResponse(ReputationBase):
    """Schema for reputation response"""
    id: int
    reviewer_id: int
    reviewer_username: Optional[str] = None
    reviewed_user_id: int
    reviewed_user_username: Optional[str] = None
    is_verified_transaction: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ReputationSummary(BaseModel):
    """Schema for user reputation summary"""
    user_id: int
    username: str
    average_rating: float = Field(..., ge=0, le=5)
    total_ratings: int = Field(..., ge=0)
    total_transactions: int = Field(..., ge=0)
    positive_feedback_percentage: float = Field(..., ge=0, le=100)
    contribution_score: int = Field(..., ge=0)
    account_age_days: int = Field(..., ge=0)
    total_posts: int = Field(..., ge=0)
    total_verifications: int = Field(..., ge=0)
    trust_score: float = Field(..., ge=0, le=100, description="Overall trust score")

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    contribution_score: int = 0
    total_posts: int = 0
    total_verifications: int = 0
    created_at: datetime
    last_login: Optional[datetime] = None
    reputation_summary: Optional[ReputationSummary] = None

    class Config:
        from_attributes = True
