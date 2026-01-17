"""
Board models for community discussions
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class BoardType(str, enum.Enum):
    """Board type enumeration"""
    CLUB_DISCUSSION = "club_discussion"
    SEASON_KIT = "season_kit"
    MATCH_WORN = "match_worn"
    AUTHENTICITY = "authenticity"
    GENERAL = "general"


class PostCategory(str, enum.Enum):
    """Post category enumeration"""
    DISCUSSION = "discussion"
    REVIEW = "review"
    VERIFICATION = "verification"
    QUESTION = "question"
    NEWS = "news"


class Board(Base):
    """Board model for community discussions"""

    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)

    # Board details
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    board_type = Column(Enum(BoardType), nullable=False)

    # Club-specific boards
    club_name = Column(String(100), index=True)
    league = Column(String(100))

    # Metadata
    icon_url = Column(String(500))
    banner_url = Column(String(500))
    rules = Column(JSON)  # Array of rule strings

    # Stats
    total_posts = Column(Integer, default=0, nullable=False)
    total_members = Column(Integer, default=0, nullable=False)

    # Settings
    is_active = Column(Boolean, default=True, nullable=False)
    requires_moderation = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posts = relationship("Post", back_populates="board", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Board {self.name}>"


class Post(Base):
    """Post model for board discussions"""

    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Post content
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(Enum(PostCategory), nullable=False)

    # Media
    image_urls = Column(JSON)  # Array of image URLs

    # Engagement
    views_count = Column(Integer, default=0, nullable=False)
    upvotes = Column(Integer, default=0, nullable=False)
    downvotes = Column(Integer, default=0, nullable=False)

    # Status
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    board = relationship("Board", back_populates="posts")
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Post {self.title}>"


class Comment(Base):
    """Comment model for posts and listings"""

    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Polymorphic relationships (can comment on posts or listings)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)

    # Comment content
    content = Column(Text, nullable=False)

    # Threading support
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    # Engagement
    upvotes = Column(Integer, default=0, nullable=False)
    downvotes = Column(Integer, default=0, nullable=False)

    # Status
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    listing = relationship("Listing", back_populates="comments")
    parent_comment = relationship("Comment", remote_side=[id], backref="replies")

    def __repr__(self):
        return f"<Comment {self.id} by User {self.author_id}>"


class UserFavoriteClub(Base):
    """User's favorite football clubs"""

    __tablename__ = "user_favorite_clubs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Club details
    club_name = Column(String(100), nullable=False)
    league = Column(String(100))
    country = Column(String(100))

    # Display order
    priority = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="favorite_clubs")

    def __repr__(self):
        return f"<UserFavoriteClub {self.club_name} for User {self.user_id}>"
