"""
Pydantic schemas for board and post models
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.board import BoardType, PostCategory


# Board Schemas
class BoardBase(BaseModel):
    """Base schema for boards"""
    name: str = Field(..., min_length=3, max_length=100, description="Board name")
    description: Optional[str] = Field(None, description="Board description")
    board_type: BoardType = Field(..., description="Type of board")
    club_name: Optional[str] = Field(None, max_length=100, description="Football club name")
    league: Optional[str] = Field(None, max_length=100, description="League name")
    rules: Optional[List[str]] = Field(None, description="Board rules")


class BoardCreate(BoardBase):
    """Schema for creating a board"""
    slug: str = Field(..., min_length=3, max_length=100, description="URL-friendly slug")

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Validate slug format"""
        import re
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Slug can only contain lowercase letters, numbers, and hyphens")
        return v


class BoardUpdate(BaseModel):
    """Schema for updating a board"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    rules: Optional[List[str]] = None
    is_active: Optional[bool] = None
    requires_moderation: Optional[bool] = None


class BoardResponse(BoardBase):
    """Schema for board response"""
    id: int
    slug: str
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    total_posts: int = 0
    total_members: int = 0
    is_active: bool = True
    requires_moderation: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Post Schemas
class PostBase(BaseModel):
    """Base schema for posts"""
    title: str = Field(..., min_length=5, max_length=300, description="Post title")
    content: str = Field(..., min_length=10, description="Post content")
    category: PostCategory = Field(..., description="Post category")
    image_urls: Optional[List[str]] = Field(None, description="Image URLs")


class PostCreate(PostBase):
    """Schema for creating a post"""
    board_id: int = Field(..., gt=0, description="Board ID")


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    title: Optional[str] = Field(None, min_length=5, max_length=300)
    content: Optional[str] = Field(None, min_length=10)
    category: Optional[PostCategory] = None
    image_urls: Optional[List[str]] = None


class PostResponse(PostBase):
    """Schema for post response"""
    id: int
    board_id: int
    author_id: int
    author_username: Optional[str] = None
    views_count: int = 0
    upvotes: int = 0
    downvotes: int = 0
    is_pinned: bool = False
    is_locked: bool = False
    is_deleted: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Comment Schemas
class CommentBase(BaseModel):
    """Base schema for comments"""
    content: str = Field(..., min_length=1, max_length=5000, description="Comment content")


class CommentCreate(CommentBase):
    """Schema for creating a comment"""
    post_id: Optional[int] = Field(None, gt=0, description="Post ID (if commenting on a post)")
    listing_id: Optional[int] = Field(None, gt=0, description="Listing ID (if commenting on a listing)")
    parent_comment_id: Optional[int] = Field(None, gt=0, description="Parent comment ID for threading")

    @field_validator("post_id")
    @classmethod
    def validate_target(cls, v, info):
        """Ensure either post_id or listing_id is provided"""
        if v is None and info.data.get("listing_id") is None:
            raise ValueError("Either post_id or listing_id must be provided")
        return v


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    content: str = Field(..., min_length=1, max_length=5000)


class CommentResponse(CommentBase):
    """Schema for comment response"""
    id: int
    author_id: int
    author_username: Optional[str] = None
    post_id: Optional[int] = None
    listing_id: Optional[int] = None
    parent_comment_id: Optional[int] = None
    upvotes: int = 0
    downvotes: int = 0
    is_deleted: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    reply_count: Optional[int] = 0

    class Config:
        from_attributes = True


# User Favorite Club Schemas
class FavoriteClubCreate(BaseModel):
    """Schema for adding a favorite club"""
    club_name: str = Field(..., min_length=2, max_length=100)
    league: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    priority: int = Field(0, ge=0, description="Display order priority")


class FavoriteClubResponse(FavoriteClubCreate):
    """Schema for favorite club response"""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
