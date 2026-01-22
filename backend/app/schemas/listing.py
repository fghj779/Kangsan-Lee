"""
Pydantic schemas for listing models
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.listing import ListingStatus, ItemCondition, JerseyVersion


# Listing Schemas
class ListingBase(BaseModel):
    """Base schema for listings"""
    title: str = Field(..., min_length=10, max_length=200, description="Listing title")
    description: str = Field(..., min_length=20, description="Detailed description")
    club_name: str = Field(..., min_length=2, max_length=100, description="Football club name")
    season: str = Field(..., pattern=r"^\d{4}(/\d{2,4})?$", description="Season (e.g., 2023/24)")
    league: Optional[str] = Field(None, max_length=100, description="League name")
    jersey_version: JerseyVersion = Field(..., description="Jersey version type")
    size: str = Field(..., description="Jersey size")
    player_name: Optional[str] = Field(None, max_length=100, description="Player name on jersey")
    player_number: Optional[str] = Field(None, max_length=5, description="Player number on jersey")
    condition: ItemCondition = Field(..., description="Item condition")
    price: float = Field(..., gt=0, description="Price in USD")
    is_negotiable: bool = Field(True, description="Price is negotiable")
    purchase_source: Optional[str] = Field(None, max_length=200, description="Where item was purchased")
    image_urls: List[str] = Field(..., min_length=1, description="Item image URLs")

    @field_validator("image_urls")
    @classmethod
    def validate_images(cls, v: List[str]) -> List[str]:
        """Ensure at least one image is provided"""
        if not v or len(v) < 1:
            raise ValueError("At least one image is required")
        if len(v) > 10:
            raise ValueError("Maximum 10 images allowed")
        return v

    @field_validator("size")
    @classmethod
    def validate_size(cls, v: str) -> str:
        """Validate size format"""
        valid_sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
        if v.upper() not in valid_sizes:
            raise ValueError(f"Size must be one of: {', '.join(valid_sizes)}")
        return v.upper()


class ListingCreate(ListingBase):
    """Schema for creating a listing"""
    pass


class ListingUpdate(BaseModel):
    """Schema for updating a listing"""
    title: Optional[str] = Field(None, min_length=10, max_length=200)
    description: Optional[str] = Field(None, min_length=20)
    price: Optional[float] = Field(None, gt=0)
    is_negotiable: Optional[bool] = None
    status: Optional[ListingStatus] = None
    authenticity_verified: Optional[bool] = None
    verification_notes: Optional[str] = None


class ListingResponse(ListingBase):
    """Schema for listing response"""
    id: int
    seller_id: int
    seller_username: Optional[str] = None
    seller_reputation_score: Optional[float] = None
    authenticity_verified: bool = False
    verification_notes: Optional[str] = None
    status: ListingStatus
    views_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    sold_at: Optional[datetime] = None
    offer_count: Optional[int] = 0
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Offer Schemas
class OfferBase(BaseModel):
    """Base schema for offers"""
    amount: float = Field(..., gt=0, description="Offer amount")
    message: Optional[str] = Field(None, max_length=500, description="Message to seller")


class OfferCreate(OfferBase):
    """Schema for creating an offer"""
    listing_id: int = Field(..., gt=0, description="Listing ID")


class OfferUpdate(BaseModel):
    """Schema for updating an offer"""
    status: str = Field(..., pattern="^(accepted|rejected|withdrawn)$")


class OfferResponse(OfferBase):
    """Schema for offer response"""
    id: int
    listing_id: int
    buyer_id: int
    buyer_username: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionResponse(BaseModel):
    """Schema for transaction response"""
    id: int
    listing_id: int
    buyer_id: int
    buyer_username: Optional[str] = None
    seller_username: Optional[str] = None
    final_price: float
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Collection Schemas
class CollectionBase(BaseModel):
    """Base schema for collection items"""
    club_name: str = Field(..., min_length=2, max_length=100)
    season: str = Field(..., pattern=r"^\d{4}(/\d{2,4})?$")
    jersey_version: JerseyVersion
    player_name: Optional[str] = Field(None, max_length=100)
    player_number: Optional[str] = Field(None, max_length=5)
    notes: Optional[str] = None
    image_urls: Optional[List[str]] = None
    is_for_sale: bool = Field(False, description="Item is available for sale")
    display_order: int = Field(0, ge=0)


class CollectionCreate(CollectionBase):
    """Schema for creating a collection item"""
    pass


class CollectionUpdate(BaseModel):
    """Schema for updating a collection item"""
    notes: Optional[str] = None
    image_urls: Optional[List[str]] = None
    is_for_sale: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)


class CollectionResponse(CollectionBase):
    """Schema for collection response"""
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True
