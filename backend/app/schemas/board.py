"""
Board schemas for API validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.board import BoardType, PostCategory


# Board Schemas
class BoardBase(BaseModel):
    """Base board schema"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    board_type: BoardType
    club_name: Optional[str] = None
    league: Optional[str] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    rules: Optional[List[str]] = None


class BoardCreate(BoardBase):
    """Schema for creating a board"""
    pass


class BoardUpdate(BaseModel):
    """Schema for updating a board"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    rules: Optional[List[str]] = None


class BoardResponse(BoardBase):
    """Schema for board responses"""
    id: int
    total_posts: int
    total_members: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Post Schemas
class PostBase(BaseModel):
    """Base post schema"""
    title: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1)
    category: PostCategory
    image_urls: Optional[List[str]] = None


class PostCreate(PostBase):
    """Schema for creating a post"""
    board_id: int


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    content: Optional[str] = Field(None, min_length=1)
    image_urls: Optional[List[str]] = None


class PostResponse(PostBase):
    """Schema for post responses"""
    id: int
    board_id: int
    author_id: int
    views_count: int
    upvotes: int
    downvotes: int
    is_pinned: bool
    is_locked: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Author info
    author_username: Optional[str] = None
    author_avatar: Optional[str] = None

    # Comment count
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Comment Schemas
class CommentBase(BaseModel):
    """Base comment schema"""
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    """Schema for creating a comment"""
    post_id: Optional[int] = None
    listing_id: Optional[int] = None
    parent_comment_id: Optional[int] = None


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    content: str = Field(..., min_length=1)


class CommentResponse(CommentBase):
    """Schema for comment responses"""
    id: int
    author_id: int
    post_id: Optional[int] = None
    listing_id: Optional[int] = None
    parent_comment_id: Optional[int] = None
    upvotes: int
    downvotes: int
    is_deleted: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    # Author info
    author_username: Optional[str] = None
    author_avatar: Optional[str] = None

    class Config:
        from_attributes = True


# User Favorite Club Schemas
class FavoriteClubCreate(BaseModel):
    """Schema for adding a favorite club"""
    club_name: str = Field(..., min_length=1, max_length=100)
    league: Optional[str] = None
    country: Optional[str] = None
    priority: int = 0


class FavoriteClubResponse(BaseModel):
    """Schema for favorite club responses"""
    id: int
    club_name: str
    league: Optional[str] = None
    country: Optional[str] = None
    priority: int
    created_at: datetime

    class Config:
        from_attributes = True
