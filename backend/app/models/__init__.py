"""
Database models initialization
"""
from app.models.user import User, UserRole
from app.models.listing import (
    Listing,
    Offer,
    Transaction,
    Collection,
    ListingStatus,
    ItemCondition,
    JerseyVersion,
)
from app.models.board import (
    Board,
    Post,
    Comment,
    UserFavoriteClub,
    BoardType,
    PostCategory,
)
from app.models.message import Message, MessageStatus, ConversationType
from app.models.reputation import (
    Reputation,
    VerificationRequest,
    ReputationType,
    Rating,
)

__all__ = [
    # User models
    "User",
    "UserRole",
    # Listing models
    "Listing",
    "Offer",
    "Transaction",
    "Collection",
    "ListingStatus",
    "ItemCondition",
    "JerseyVersion",
    # Board models
    "Board",
    "Post",
    "Comment",
    "UserFavoriteClub",
    "BoardType",
    "PostCategory",
    # Message models
    "Message",
    "MessageStatus",
    "ConversationType",
    # Reputation models
    "Reputation",
    "VerificationRequest",
    "ReputationType",
    "Rating",
]
