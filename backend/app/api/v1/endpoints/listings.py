"""
Listing API endpoints with comprehensive error handling
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from typing import List
import logging
from datetime import datetime

from app.core.database import get_db
from app.core.exceptions import (
    NotFoundException,
    ValidationException,
    AuthorizationException,
    DatabaseException,
)
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.listing import (
    Listing,
    ListingStatus,
    ItemCondition,
    JerseyVersion,
    Offer,
    Transaction,
    Collection,
)
from app.models.board import Comment
from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    OfferCreate,
    OfferUpdate,
    OfferResponse,
    TransactionResponse,
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    club_name: str = Query(None, description="Filter by club name"),
    season: str = Query(None, description="Filter by season"),
    jersey_version: JerseyVersion = Query(None, description="Filter by jersey version"),
    condition: ItemCondition = Query(None, description="Filter by condition"),
    min_price: float = Query(None, ge=0, description="Minimum price"),
    max_price: float = Query(None, ge=0, description="Maximum price"),
    search: str = Query(None, description="Search in title and description"),
    status_filter: ListingStatus = Query(ListingStatus.ACTIVE, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    """Get all listings with filtering and pagination"""
    try:
        query = select(Listing).where(Listing.status == status_filter)

        if club_name:
            query = query.where(Listing.club_name.ilike(f"%{club_name}%"))

        if season:
            query = query.where(Listing.season == season)

        if jersey_version:
            query = query.where(Listing.jersey_version == jersey_version)

        if condition:
            query = query.where(Listing.condition == condition)

        if min_price is not None:
            query = query.where(Listing.price >= min_price)

        if max_price is not None:
            query = query.where(Listing.price <= max_price)

        if search:
            query = query.where(
                or_(
                    Listing.title.ilike(f"%{search}%"),
                    Listing.description.ilike(f"%{search}%"),
                    Listing.club_name.ilike(f"%{search}%"),
                )
            )

        query = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        listings = result.scalars().all()

        # Enrich with seller info
        response_listings = []
        for listing in listings:
            seller = await db.get(User, listing.seller_id)
            offer_count = await db.scalar(
                select(func.count(Offer.id)).where(Offer.listing_id == listing.id)
            )
            comment_count = await db.scalar(
                select(func.count(Comment.id)).where(
                    Comment.listing_id == listing.id,
                    Comment.is_deleted == False
                )
            )

            listing_dict = {
                **listing.__dict__,
                "seller_username": seller.username if seller else None,
                "seller_reputation_score": None,  # TODO: Calculate from reputation table
                "offer_count": offer_count or 0,
                "comment_count": comment_count or 0,
            }
            response_listings.append(ListingResponse.model_validate(listing_dict))

        return response_listings

    except Exception as e:
        logger.error(f"Error fetching listings: {str(e)}")
        raise DatabaseException("Failed to fetch listings")


@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new listing"""
    try:
        listing = Listing(
            **listing_data.model_dump(),
            seller_id=current_user.id
        )
        db.add(listing)
        await db.commit()
        await db.refresh(listing)

        listing_dict = {
            **listing.__dict__,
            "seller_username": current_user.username,
            "seller_reputation_score": None,
            "offer_count": 0,
            "comment_count": 0,
        }

        logger.info(f"Listing created: {listing.title} by user {current_user.username}")
        return ListingResponse.model_validate(listing_dict)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating listing: {str(e)}")
        raise DatabaseException("Failed to create listing")


@router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a listing by ID"""
    try:
        result = await db.execute(select(Listing).where(Listing.id == listing_id))
        listing = result.scalar_one_or_none()

        if not listing:
            raise NotFoundException("Listing", listing_id)

        # Increment view count
        listing.views_count += 1
        await db.commit()

        # Enrich with seller info
        seller = await db.get(User, listing.seller_id)
        offer_count = await db.scalar(
            select(func.count(Offer.id)).where(Offer.listing_id == listing.id)
        )
        comment_count = await db.scalar(
            select(func.count(Comment.id)).where(
                Comment.listing_id == listing.id,
                Comment.is_deleted == False
            )
        )

        listing_dict = {
            **listing.__dict__,
            "seller_username": seller.username if seller else None,
            "seller_reputation_score": None,
            "offer_count": offer_count or 0,
            "comment_count": comment_count or 0,
        }

        return ListingResponse.model_validate(listing_dict)

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching listing {listing_id}: {str(e)}")
        raise DatabaseException("Failed to fetch listing")


@router.put("/listings/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a listing (seller only)"""
    try:
        result = await db.execute(select(Listing).where(Listing.id == listing_id))
        listing = result.scalar_one_or_none()

        if not listing:
            raise NotFoundException("Listing", listing_id)

        if listing.seller_id != current_user.id:
            raise AuthorizationException("You can only edit your own listings")

        update_data = listing_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(listing, field, value)

        await db.commit()
        await db.refresh(listing)

        seller = await db.get(User, listing.seller_id)
        offer_count = await db.scalar(
            select(func.count(Offer.id)).where(Offer.listing_id == listing.id)
        )
        comment_count = await db.scalar(
            select(func.count(Comment.id)).where(Comment.listing_id == listing.id)
        )

        listing_dict = {
            **listing.__dict__,
            "seller_username": seller.username if seller else None,
            "seller_reputation_score": None,
            "offer_count": offer_count or 0,
            "comment_count": comment_count or 0,
        }

        return ListingResponse.model_validate(listing_dict)

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating listing {listing_id}: {str(e)}")
        raise DatabaseException("Failed to update listing")


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a listing (seller only)"""
    try:
        result = await db.execute(select(Listing).where(Listing.id == listing_id))
        listing = result.scalar_one_or_none()

        if not listing:
            raise NotFoundException("Listing", listing_id)

        if listing.seller_id != current_user.id:
            raise AuthorizationException("You can only delete your own listings")

        listing.status = ListingStatus.DELETED
        await db.commit()

        logger.info(f"Listing deleted: {listing.title} by user {current_user.username}")
        return None

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting listing {listing_id}: {str(e)}")
        raise DatabaseException("Failed to delete listing")


# Offer endpoints
@router.get("/listings/{listing_id}/offers", response_model=List[OfferResponse])
async def get_listing_offers(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all offers for a listing (seller can see all, buyer sees only their own)"""
    try:
        # Verify listing exists
        result = await db.execute(select(Listing).where(Listing.id == listing_id))
        listing = result.scalar_one_or_none()
        if not listing:
            raise NotFoundException("Listing", listing_id)

        query = select(Offer).where(Offer.listing_id == listing_id)

        # If not the seller, only show user's own offers
        if listing.seller_id != current_user.id:
            query = query.where(Offer.buyer_id == current_user.id)

        query = query.order_by(Offer.created_at.desc())

        result = await db.execute(query)
        offers = result.scalars().all()

        # Enrich with buyer info
        response_offers = []
        for offer in offers:
            buyer = await db.get(User, offer.buyer_id)
            offer_dict = {
                **offer.__dict__,
                "buyer_username": buyer.username if buyer else None,
            }
            response_offers.append(OfferResponse.model_validate(offer_dict))

        return response_offers

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching offers for listing {listing_id}: {str(e)}")
        raise DatabaseException("Failed to fetch offers")


@router.post("/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    offer_data: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create an offer on a listing"""
    try:
        # Verify listing exists and is active
        result = await db.execute(select(Listing).where(Listing.id == offer_data.listing_id))
        listing = result.scalar_one_or_none()
        if not listing:
            raise NotFoundException("Listing", offer_data.listing_id)

        if listing.status != ListingStatus.ACTIVE:
            raise ValidationException("Cannot make offers on inactive listings")

        if listing.seller_id == current_user.id:
            raise ValidationException("You cannot make an offer on your own listing")

        # Check for existing pending offer from this user
        result = await db.execute(
            select(Offer).where(
                and_(
                    Offer.listing_id == offer_data.listing_id,
                    Offer.buyer_id == current_user.id,
                    Offer.status == "pending"
                )
            )
        )
        if result.scalar_one_or_none():
            raise ValidationException("You already have a pending offer on this listing")

        offer = Offer(
            **offer_data.model_dump(),
            buyer_id=current_user.id
        )
        db.add(offer)
        await db.commit()
        await db.refresh(offer)

        offer_dict = {
            **offer.__dict__,
            "buyer_username": current_user.username,
        }

        logger.info(f"Offer created: {offer.amount} on listing {listing.id} by user {current_user.username}")
        return OfferResponse.model_validate(offer_dict)

    except (NotFoundException, ValidationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating offer: {str(e)}")
        raise DatabaseException("Failed to create offer")


@router.put("/offers/{offer_id}", response_model=OfferResponse)
async def update_offer(
    offer_id: int,
    offer_data: OfferUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an offer status (accept/reject by seller, withdraw by buyer)"""
    try:
        result = await db.execute(select(Offer).where(Offer.id == offer_id))
        offer = result.scalar_one_or_none()

        if not offer:
            raise NotFoundException("Offer", offer_id)

        # Get listing to check seller
        listing = await db.get(Listing, offer.listing_id)

        # Validate permissions
        if offer_data.status in ["accepted", "rejected"]:
            if listing.seller_id != current_user.id:
                raise AuthorizationException("Only the seller can accept or reject offers")
        elif offer_data.status == "withdrawn":
            if offer.buyer_id != current_user.id:
                raise AuthorizationException("Only the buyer can withdraw their offer")

        offer.status = offer_data.status

        # If accepted, create transaction and update listing status
        if offer_data.status == "accepted":
            listing.status = ListingStatus.RESERVED

            transaction = Transaction(
                listing_id=listing.id,
                buyer_id=offer.buyer_id,
                final_price=offer.amount,
                status="pending"
            )
            db.add(transaction)

            # Reject all other pending offers
            other_offers_result = await db.execute(
                select(Offer).where(
                    and_(
                        Offer.listing_id == listing.id,
                        Offer.id != offer.id,
                        Offer.status == "pending"
                    )
                )
            )
            for other_offer in other_offers_result.scalars().all():
                other_offer.status = "rejected"

        await db.commit()
        await db.refresh(offer)

        buyer = await db.get(User, offer.buyer_id)
        offer_dict = {
            **offer.__dict__,
            "buyer_username": buyer.username if buyer else None,
        }

        return OfferResponse.model_validate(offer_dict)

    except (NotFoundException, ValidationException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating offer {offer_id}: {str(e)}")
        raise DatabaseException("Failed to update offer")


# Transaction endpoints
@router.get("/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all transactions for current user (as buyer or seller)"""
    try:
        # Get transactions as buyer
        buyer_result = await db.execute(
            select(Transaction).where(Transaction.buyer_id == current_user.id)
        )
        buyer_transactions = buyer_result.scalars().all()

        # Get transactions as seller
        seller_result = await db.execute(
            select(Transaction)
            .join(Listing)
            .where(Listing.seller_id == current_user.id)
        )
        seller_transactions = seller_result.scalars().all()

        all_transactions = list(buyer_transactions) + list(seller_transactions)
        all_transactions.sort(key=lambda x: x.created_at, reverse=True)

        # Enrich with user info
        response_transactions = []
        for transaction in all_transactions:
            buyer = await db.get(User, transaction.buyer_id)
            listing = await db.get(Listing, transaction.listing_id)
            seller = await db.get(User, listing.seller_id) if listing else None

            transaction_dict = {
                **transaction.__dict__,
                "buyer_username": buyer.username if buyer else None,
                "seller_username": seller.username if seller else None,
            }
            response_transactions.append(TransactionResponse.model_validate(transaction_dict))

        return response_transactions

    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise DatabaseException("Failed to fetch transactions")


@router.put("/transactions/{transaction_id}/complete", response_model=TransactionResponse)
async def complete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a transaction as completed (seller only)"""
    try:
        result = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
        transaction = result.scalar_one_or_none()

        if not transaction:
            raise NotFoundException("Transaction", transaction_id)

        listing = await db.get(Listing, transaction.listing_id)
        if listing.seller_id != current_user.id:
            raise AuthorizationException("Only the seller can complete this transaction")

        transaction.status = "completed"
        transaction.completed_at = datetime.utcnow()
        listing.status = ListingStatus.SOLD
        listing.sold_at = datetime.utcnow()

        await db.commit()
        await db.refresh(transaction)

        buyer = await db.get(User, transaction.buyer_id)
        seller = await db.get(User, listing.seller_id)

        transaction_dict = {
            **transaction.__dict__,
            "buyer_username": buyer.username if buyer else None,
            "seller_username": seller.username if seller else None,
        }

        logger.info(f"Transaction {transaction.id} completed")
        return TransactionResponse.model_validate(transaction_dict)

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error completing transaction {transaction_id}: {str(e)}")
        raise DatabaseException("Failed to complete transaction")


# Collection endpoints
@router.get("/users/{user_id}/collection", response_model=List[CollectionResponse])
async def get_user_collection(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get user's jersey collection"""
    try:
        result = await db.execute(
            select(Collection)
            .where(Collection.owner_id == user_id)
            .order_by(Collection.display_order.desc(), Collection.created_at.desc())
        )
        collections = result.scalars().all()

        return collections

    except Exception as e:
        logger.error(f"Error fetching collection for user {user_id}: {str(e)}")
        raise DatabaseException("Failed to fetch collection")


@router.post("/collection", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def add_to_collection(
    collection_data: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add an item to user's collection"""
    try:
        collection_item = Collection(
            **collection_data.model_dump(),
            owner_id=current_user.id
        )
        db.add(collection_item)
        await db.commit()
        await db.refresh(collection_item)

        return collection_item

    except Exception as e:
        await db.rollback()
        logger.error(f"Error adding to collection: {str(e)}")
        raise DatabaseException("Failed to add to collection")


@router.put("/collection/{item_id}", response_model=CollectionResponse)
async def update_collection_item(
    item_id: int,
    collection_data: CollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a collection item (owner only)"""
    try:
        result = await db.execute(select(Collection).where(Collection.id == item_id))
        collection_item = result.scalar_one_or_none()

        if not collection_item:
            raise NotFoundException("Collection item", item_id)

        if collection_item.owner_id != current_user.id:
            raise AuthorizationException("You can only edit your own collection items")

        update_data = collection_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(collection_item, field, value)

        await db.commit()
        await db.refresh(collection_item)

        return collection_item

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating collection item {item_id}: {str(e)}")
        raise DatabaseException("Failed to update collection item")


@router.delete("/collection/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a collection item (owner only)"""
    try:
        result = await db.execute(select(Collection).where(Collection.id == item_id))
        collection_item = result.scalar_one_or_none()

        if not collection_item:
            raise NotFoundException("Collection item", item_id)

        if collection_item.owner_id != current_user.id:
            raise AuthorizationException("You can only delete your own collection items")

        await db.delete(collection_item)
        await db.commit()

        return None

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting collection item {item_id}: {str(e)}")
        raise DatabaseException("Failed to delete collection item")


# Listing comments endpoint
@router.get("/listings/{listing_id}/comments", response_model=List)
async def get_listing_comments(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all comments for a listing"""
    try:
        from app.schemas.board import CommentResponse

        result = await db.execute(
            select(Comment)
            .where(Comment.listing_id == listing_id, Comment.is_deleted == False)
            .order_by(Comment.created_at.asc())
        )
        comments = result.scalars().all()

        # Enrich with author info
        response_comments = []
        for comment in comments:
            author = await db.get(User, comment.author_id)
            reply_count = await db.scalar(
                select(func.count(Comment.id)).where(
                    Comment.parent_comment_id == comment.id,
                    Comment.is_deleted == False
                )
            )

            comment_dict = {
                **comment.__dict__,
                "author_username": author.username if author else None,
                "reply_count": reply_count or 0,
            }
            response_comments.append(CommentResponse.model_validate(comment_dict))

        return response_comments

    except Exception as e:
        logger.error(f"Error fetching comments for listing {listing_id}: {str(e)}")
        raise DatabaseException("Failed to fetch comments")
