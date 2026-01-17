"""
Listing schemas for API validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.listing import ListingStatus, ItemCondition, JerseyVersion


# Listing Schemas
class ListingBase(BaseModel):
    """Base listing schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    club_name: str = Field(..., min_length=1, max_length=100)
    season: str = Field(..., min_length=1, max_length=20)
    league: Optional[str] = None
    jersey_version: JerseyVersion
    size: str = Field(..., min_length=1, max_length=10)
    player_name: Optional[str] = None
    player_number: Optional[str] = None
    condition: ItemCondition
    price: float = Field(..., gt=0)
    is_negotiable: bool = True
    purchase_source: Optional[str] = None
    verification_notes: Optional[str] = None
    image_urls: List[str] = Field(..., min_items=1)


class ListingCreate(ListingBase):
    """Schema for creating a listing"""
    pass


class ListingUpdate(BaseModel):
    """Schema for updating a listing"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    is_negotiable: Optional[bool] = None
    status: Optional[ListingStatus] = None
    image_urls: Optional[List[str]] = None


class ListingResponse(ListingBase):
    """Schema for listing responses"""
    id: int
    seller_id: int
    status: ListingStatus
    views_count: int
    authenticity_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    sold_at: Optional[datetime] = None

    # Seller info
    seller_username: Optional[str] = None
    seller_avatar: Optional[str] = None
    seller_reputation_score: Optional[int] = 0

    # Comment count
    comment_count: Optional[int] = 0
    offer_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Offer Schemas
class OfferBase(BaseModel):
    """Base offer schema"""
    amount: float = Field(..., gt=0)
    message: Optional[str] = None


class OfferCreate(OfferBase):
    """Schema for creating an offer"""
    listing_id: int


class OfferUpdate(BaseModel):
    """Schema for updating an offer"""
    status: str = Field(..., pattern="^(accepted|rejected|withdrawn)$")


class OfferResponse(OfferBase):
    """Schema for offer responses"""
    id: int
    listing_id: int
    buyer_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Buyer info
    buyer_username: Optional[str] = None
    buyer_avatar: Optional[str] = None

    # Listing info
    listing_title: Optional[str] = None

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionCreate(BaseModel):
    """Schema for creating a transaction"""
    listing_id: int
    final_price: float = Field(..., gt=0)


class TransactionResponse(BaseModel):
    """Schema for transaction responses"""
    id: int
    listing_id: int
    buyer_id: int
    final_price: float
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Collection Schemas
class CollectionBase(BaseModel):
    """Base collection schema"""
    club_name: str = Field(..., min_length=1, max_length=100)
    season: str = Field(..., min_length=1, max_length=20)
    jersey_version: JerseyVersion
    player_name: Optional[str] = None
    player_number: Optional[str] = None
    notes: Optional[str] = None
    image_urls: Optional[List[str]] = None
    is_for_sale: bool = False
    display_order: int = 0


class CollectionCreate(CollectionBase):
    """Schema for creating a collection item"""
    pass


class CollectionUpdate(BaseModel):
    """Schema for updating a collection item"""
    notes: Optional[str] = None
    image_urls: Optional[List[str]] = None
    is_for_sale: Optional[bool] = None
    display_order: Optional[int] = None


class CollectionResponse(CollectionBase):
    """Schema for collection responses"""
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True
