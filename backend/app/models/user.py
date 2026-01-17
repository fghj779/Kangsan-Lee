"""
User model with comprehensive validation
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    COLLECTOR = "collector"
    SELLER = "seller"
    BUYER = "buyer"
    MODERATOR = "moderator"
    ADMIN = "admin"


class User(Base):
    """User model for authentication and profiles"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile information
    full_name = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(500))
    location = Column(String(100))

    # User role and status
    role = Column(Enum(UserRole), default=UserRole.COLLECTOR, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Community contribution
    contribution_score = Column(Integer, default=0, nullable=False)
    total_posts = Column(Integer, default=0, nullable=False)
    total_verifications = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    sent_messages = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan"
    )
    received_messages = relationship(
        "Message",
        foreign_keys="Message.receiver_id",
        back_populates="receiver",
        cascade="all, delete-orphan"
    )
    transactions = relationship("Transaction", back_populates="buyer", cascade="all, delete-orphan")
    reputation_given = relationship(
        "Reputation",
        foreign_keys="Reputation.reviewer_id",
        back_populates="reviewer",
        cascade="all, delete-orphan"
    )
    reputation_received = relationship(
        "Reputation",
        foreign_keys="Reputation.reviewed_user_id",
        back_populates="reviewed_user",
        cascade="all, delete-orphan"
    )
    favorite_clubs = relationship("UserFavoriteClub", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="owner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"
