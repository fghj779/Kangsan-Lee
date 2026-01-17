"""
Reputation schemas for API validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.reputation import ReputationType, Rating


# Reputation Schemas
class ReputationBase(BaseModel):
    """Base reputation schema"""
    reputation_type: ReputationType
    rating: Rating
    feedback: str = Field(..., min_length=10, max_length=1000)


class ReputationCreate(ReputationBase):
    """Schema for creating reputation"""
    reviewed_user_id: int
    transaction_id: Optional[int] = None
    listing_id: Optional[int] = None


class ReputationResponse(ReputationBase):
    """Schema for reputation responses"""
    id: int
    reviewer_id: int
    reviewed_user_id: int
    transaction_id: Optional[int] = None
    listing_id: Optional[int] = None
    is_public: bool
    created_at: datetime

    # Reviewer info
    reviewer_username: Optional[str] = None
    reviewer_avatar: Optional[str] = None

    class Config:
        from_attributes = True


# Verification Request Schemas
class VerificationRequestCreate(BaseModel):
    """Schema for creating a verification request"""
    item_description: str = Field(..., min_length=10)
    image_urls: List[str] = Field(..., min_items=1)
    listing_id: Optional[int] = None


class VerificationRequestResponse(BaseModel):
    """Schema for verification request responses"""
    id: int
    requester_id: int
    listing_id: Optional[int] = None
    item_description: str
    image_urls: str
    status: str
    verifier_id: Optional[int] = None
    verification_notes: Optional[str] = None
    created_at: datetime
    verified_at: Optional[datetime] = None

    # Requester info
    requester_username: Optional[str] = None

    # Verifier info
    verifier_username: Optional[str] = None

    class Config:
        from_attributes = True


class VerificationUpdate(BaseModel):
    """Schema for updating verification status"""
    status: str = Field(..., pattern="^(verified|fake|inconclusive)$")
    verification_notes: str = Field(..., min_length=10)
