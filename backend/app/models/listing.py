"""
Listing model for marketplace items
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ListingStatus(str, enum.Enum):
    """Listing status enumeration"""
    ACTIVE = "active"
    SOLD = "sold"
    RESERVED = "reserved"
    DELETED = "deleted"


class ItemCondition(str, enum.Enum):
    """Item condition enumeration"""
    NEW_WITH_TAGS = "new_with_tags"
    NEW_WITHOUT_TAGS = "new_without_tags"
    EXCELLENT = "excellent"
    VERY_GOOD = "very_good"
    GOOD = "good"
    FAIR = "fair"


class JerseyVersion(str, enum.Enum):
    """Jersey version enumeration"""
    REPLICA = "replica"
    PLAYER_ISSUE = "player_issue"
    MATCH_WORN = "match_worn"
    AUTHENTIC = "authentic"


class Listing(Base):
    """Listing model for marketplace items"""

    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Item details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    club_name = Column(String(100), nullable=False, index=True)
    season = Column(String(20), nullable=False)  # e.g., "2023/24"
    league = Column(String(100))

    # Jersey specific
    jersey_version = Column(Enum(JerseyVersion), nullable=False)
    size = Column(String(10), nullable=False)
    player_name = Column(String(100))
    player_number = Column(String(5))

    # Item condition and pricing
    condition = Column(Enum(ItemCondition), nullable=False)
    price = Column(Float, nullable=False)
    is_negotiable = Column(Boolean, default=True, nullable=False)

    # Provenance and authenticity
    purchase_source = Column(String(200))
    authenticity_verified = Column(Boolean, default=False, nullable=False)
    verification_notes = Column(Text)

    # Images (stored as JSON array of URLs)
    image_urls = Column(JSON, nullable=False)

    # Status
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False, index=True)
    views_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    sold_at = Column(DateTime(timezone=True))

    # Relationships
    seller = relationship("User", back_populates="listings")
    comments = relationship("Comment", back_populates="listing", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="listing", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="listing", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Listing {self.title} - {self.club_name}>"


class Offer(Base):
    """Offer model for negotiations"""

    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Offer details
    amount = Column(Float, nullable=False)
    message = Column(Text)
    status = Column(
        Enum("pending", "accepted", "rejected", "withdrawn", name="offer_status"),
        default="pending",
        nullable=False
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="offers")
    buyer = relationship("User")

    def __repr__(self):
        return f"<Offer {self.amount} for Listing {self.listing_id}>"


class Transaction(Base):
    """Transaction model for completed sales"""

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Transaction details
    final_price = Column(Float, nullable=False)
    status = Column(
        Enum("pending", "completed", "cancelled", "disputed", name="transaction_status"),
        default="pending",
        nullable=False
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    listing = relationship("Listing", back_populates="transactions")
    buyer = relationship("User", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction {self.id} - {self.status}>"


class Collection(Base):
    """User's jersey collection showcase"""

    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Item details
    club_name = Column(String(100), nullable=False)
    season = Column(String(20), nullable=False)
    jersey_version = Column(Enum(JerseyVersion), nullable=False)
    player_name = Column(String(100))
    player_number = Column(String(5))

    # Collection info
    notes = Column(Text)
    image_urls = Column(JSON)
    is_for_sale = Column(Boolean, default=False, nullable=False)
    display_order = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="collections")

    def __repr__(self):
        return f"<Collection {self.club_name} {self.season}>"
