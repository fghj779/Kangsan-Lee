"""
Message models for real-time communication
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class MessageStatus(str, enum.Enum):
    """Message status enumeration"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"


class ConversationType(str, enum.Enum):
    """Conversation type enumeration"""
    DIRECT = "direct"
    LISTING_INQUIRY = "listing_inquiry"


class Message(Base):
    """Message model for real-time communication"""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Message content
    content = Column(Text, nullable=False)

    # Context
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    conversation_type = Column(Enum(ConversationType), default=ConversationType.DIRECT, nullable=False)

    # Status
    status = Column(Enum(MessageStatus), default=MessageStatus.SENT, nullable=False)
    is_deleted_by_sender = Column(Boolean, default=False, nullable=False)
    is_deleted_by_receiver = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True))

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

    def __repr__(self):
        return f"<Message {self.id} from {self.sender_id} to {self.receiver_id}>"
