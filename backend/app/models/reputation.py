"""
Reputation models for trust and verification
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ReputationType(str, enum.Enum):
    """Reputation type enumeration"""
    TRANSACTION = "transaction"
    COMMUNITY = "community"
    VERIFICATION = "verification"


class Rating(str, enum.Enum):
    """Rating enumeration"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class Reputation(Base):
    """Reputation model for trust system"""

    __tablename__ = "reputations"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Reputation details
    reputation_type = Column(Enum(ReputationType), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 star rating
    feedback_text = Column(Text, nullable=False)
    is_verified_transaction = Column(Boolean, default=False, nullable=False)

    # Context
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)

    # Visibility
    is_public = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reputation_given")
    reviewed_user = relationship("User", foreign_keys=[reviewed_user_id], back_populates="reputation_received")

    def __repr__(self):
        return f"<Reputation {self.rating} for User {self.reviewed_user_id}>"


class VerificationRequest(Base):
    """Verification requests for authenticity checks"""

    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)

    # Request details
    item_description = Column(Text, nullable=False)
    image_urls = Column(String(1000))  # JSON array

    # Verification status
    status = Column(
        Enum("pending", "verified", "fake", "inconclusive", name="verification_status"),
        default="pending",
        nullable=False
    )
    verifier_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    verified_at = Column(DateTime(timezone=True))

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id])
    verifier = relationship("User", foreign_keys=[verifier_id])

    def __repr__(self):
        return f"<VerificationRequest {self.id} - {self.status}>"
