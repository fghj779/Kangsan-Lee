"""
Marketplace listing endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.listing import Listing, Offer, Transaction, Collection, ListingStatus
from app.models.board import Comment
from app.models.reputation import Reputation
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingResponse,
    OfferCreate, OfferUpdate, OfferResponse,
    TransactionCreate, TransactionResponse,
    CollectionCreate, CollectionUpdate, CollectionResponse
)
from app.core.exceptions import NotFoundException, ValidationException, AuthorizationException

router = APIRouter()


# Listing Endpoints
@router.get("/listings", response_model=List[ListingResponse])
async def get_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = "active",
    club_name: Optional[str] = None,
    season: Optional[str] = None,
    jersey_version: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|price|views_count)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db)
):
    """Get marketplace listings with filtering and sorting"""
    query = select(Listing)

    # Apply filters
    if status:
        query = query.where(Listing.status == status)
    if club_name:
        query = query.where(Listing.club_name.ilike(f"%{club_name}%"))
    if season:
        query = query.where(Listing.season == season)
    if jersey_version:
        query = query.where(Listing.jersey_version == jersey_version)
    if min_price:
        query = query.where(Listing.price >= min_price)
    if max_price:
        query = query.where(Listing.price <= max_price)

    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Listing, sort_by)))
    else:
        query = query.order_by(getattr(Listing, sort_by))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    listings = result.scalars().all()

    # Enrich with seller info and counts
    enriched_listings = []
    for listing in listings:
        # Get seller info
        seller_result = await db.execute(
            select(User).where(User.id == listing.seller_id)
        )
        seller = seller_result.scalar_one_or_none()

        # Get seller reputation score
        rep_result = await db.execute(
            select(func.count(Reputation.id)).where(
                Reputation.reviewed_user_id == listing.seller_id,
                Reputation.rating == "positive"
            )
        )
        rep_score = rep_result.scalar()

        # Get comment count
        comment_count_result = await db.execute(
            select(func.count(Comment.id)).where(
                Comment.listing_id == listing.id,
                Comment.is_deleted == False
            )
        )
        comment_count = comment_count_result.scalar()

        # Get offer count
        offer_count_result = await db.execute(
            select(func.count(Offer.id)).where(Offer.listing_id == listing.id)
        )
        offer_count = offer_count_result.scalar()

        listing_dict = {
            **listing.__dict__,
            "seller_username": seller.username if seller else None,
            "seller_avatar": seller.avatar_url if seller else None,
            "seller_reputation_score": rep_score,
            "comment_count": comment_count,
            "offer_count": offer_count
        }
        enriched_listings.append(ListingResponse(**listing_dict))

    return enriched_listings


@router.get("/listings/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific listing by ID and increment view count"""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()

    if not listing:
        raise NotFoundException("Listing", listing_id)

    # Increment view count
    listing.views_count += 1
    await db.commit()
    await db.refresh(listing)

    # Get seller info
    seller_result = await db.execute(select(User).where(User.id == listing.seller_id))
    seller = seller_result.scalar_one_or_none()

    # Get seller reputation
    rep_result = await db.execute(
        select(func.count(Reputation.id)).where(
            Reputation.reviewed_user_id == listing.seller_id,
            Reputation.rating == "positive"
        )
    )
    rep_score = rep_result.scalar()

    # Get counts
    comment_count_result = await db.execute(
        select(func.count(Comment.id)).where(
            Comment.listing_id == listing.id,
            Comment.is_deleted == False
        )
    )
    comment_count = comment_count_result.scalar()

    offer_count_result = await db.execute(
        select(func.count(Offer.id)).where(Offer.listing_id == listing.id)
    )
    offer_count = offer_count_result.scalar()

    listing_dict = {
        **listing.__dict__,
        "seller_username": seller.username if seller else None,
        "seller_avatar": seller.avatar_url if seller else None,
        "seller_reputation_score": rep_score,
        "comment_count": comment_count,
        "offer_count": offer_count
    }

    return ListingResponse(**listing_dict)


@router.post("/listings", response_model=ListingResponse)
async def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new marketplace listing"""
    new_listing = Listing(
        **listing.model_dump(),
        seller_id=current_user.id
    )

    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)

    listing_dict = {
        **new_listing.__dict__,
        "seller_username": current_user.username,
        "seller_avatar": current_user.avatar_url,
        "seller_reputation_score": 0,
        "comment_count": 0,
        "offer_count": 0
    }

    return ListingResponse(**listing_dict)


@router.put("/listings/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a listing (seller only)"""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()

    if not listing:
        raise NotFoundException("Listing", listing_id)

    if listing.seller_id != current_user.id:
        raise AuthorizationException("You can only edit your own listings")

    # Update fields
    for field, value in listing_update.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    await db.commit()
    await db.refresh(listing)

    listing_dict = {
        **listing.__dict__,
        "seller_username": current_user.username,
        "seller_avatar": current_user.avatar_url,
        "seller_reputation_score": 0,
        "comment_count": 0,
        "offer_count": 0
    }

    return ListingResponse(**listing_dict)


@router.delete("/listings/{listing_id}")
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a listing (seller only)"""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()

    if not listing:
        raise NotFoundException("Listing", listing_id)

    if listing.seller_id != current_user.id:
        raise AuthorizationException("You can only delete your own listings")

    listing.status = ListingStatus.DELETED
    await db.commit()

    return {"message": "Listing deleted successfully"}


# Offer Endpoints
@router.get("/listings/{listing_id}/offers", response_model=List[OfferResponse])
async def get_listing_offers(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get offers for a listing (seller or buyers who made offers)"""
    # Verify listing exists
    listing_result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = listing_result.scalar_one_or_none()

    if not listing:
        raise NotFoundException("Listing", listing_id)

    # Only seller can see all offers
    if listing.seller_id == current_user.id:
        query = select(Offer).where(Offer.listing_id == listing_id)
    else:
        # Buyers can only see their own offers
        query = select(Offer).where(
            Offer.listing_id == listing_id,
            Offer.buyer_id == current_user.id
        )

    query = query.order_by(desc(Offer.created_at))
    result = await db.execute(query)
    offers = result.scalars().all()

    # Enrich with buyer info
    enriched_offers = []
    for offer in offers:
        buyer_result = await db.execute(
            select(User).where(User.id == offer.buyer_id)
        )
        buyer = buyer_result.scalar_one_or_none()

        offer_dict = {
            **offer.__dict__,
            "buyer_username": buyer.username if buyer else None,
            "buyer_avatar": buyer.avatar_url if buyer else None,
            "listing_title": listing.title
        }
        enriched_offers.append(OfferResponse(**offer_dict))

    return enriched_offers


@router.post("/offers", response_model=OfferResponse)
async def create_offer(
    offer: OfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an offer on a listing"""
    # Verify listing exists and is active
    listing_result = await db.execute(select(Listing).where(Listing.id == offer.listing_id))
    listing = listing_result.scalar_one_or_none()

    if not listing:
        raise NotFoundException("Listing", offer.listing_id)

    if listing.status != ListingStatus.ACTIVE:
        raise ValidationException("Cannot make offers on inactive listings")

    if listing.seller_id == current_user.id:
        raise ValidationException("Cannot make offers on your own listings")

    new_offer = Offer(
        **offer.model_dump(),
        buyer_id=current_user.id
    )

    db.add(new_offer)
    await db.commit()
    await db.refresh(new_offer)

    offer_dict = {
        **new_offer.__dict__,
        "buyer_username": current_user.username,
        "buyer_avatar": current_user.avatar_url,
        "listing_title": listing.title
    }

    return OfferResponse(**offer_dict)


@router.put("/offers/{offer_id}", response_model=OfferResponse)
async def update_offer_status(
    offer_id: int,
    offer_update: OfferUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update offer status (seller accepts/rejects, buyer withdraws)"""
    result = await db.execute(select(Offer).where(Offer.id == offer_id))
    offer = result.scalar_one_or_none()

    if not offer:
        raise NotFoundException("Offer", offer_id)

    # Get listing
    listing_result = await db.execute(select(Listing).where(Listing.id == offer.listing_id))
    listing = listing_result.scalar_one_or_none()

    # Check authorization
    if offer_update.status == "withdrawn":
        if offer.buyer_id != current_user.id:
            raise AuthorizationException("Only the buyer can withdraw an offer")
    elif offer_update.status in ["accepted", "rejected"]:
        if listing.seller_id != current_user.id:
            raise AuthorizationException("Only the seller can accept or reject offers")

    offer.status = offer_update.status

    # If accepted, create transaction and mark listing as reserved
    if offer_update.status == "accepted":
        listing.status = ListingStatus.RESERVED

        transaction = Transaction(
            listing_id=listing.id,
            buyer_id=offer.buyer_id,
            final_price=offer.amount,
            status="pending"
        )
        db.add(transaction)

    await db.commit()
    await db.refresh(offer)

    # Get buyer info
    buyer_result = await db.execute(select(User).where(User.id == offer.buyer_id))
    buyer = buyer_result.scalar_one_or_none()

    offer_dict = {
        **offer.__dict__,
        "buyer_username": buyer.username if buyer else None,
        "buyer_avatar": buyer.avatar_url if buyer else None,
        "listing_title": listing.title
    }

    return OfferResponse(**offer_dict)


# Collection Endpoints
@router.get("/users/{user_id}/collection", response_model=List[CollectionResponse])
async def get_user_collection(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get a user's collection"""
    query = select(Collection).where(
        Collection.owner_id == user_id
    ).order_by(Collection.display_order, desc(Collection.created_at))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    collections = result.scalars().all()

    return collections


@router.post("/collection", response_model=CollectionResponse)
async def add_to_collection(
    collection: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add an item to user's collection"""
    new_collection = Collection(
        **collection.model_dump(),
        owner_id=current_user.id
    )

    db.add(new_collection)
    await db.commit()
    await db.refresh(new_collection)

    return new_collection


@router.put("/collection/{collection_id}", response_model=CollectionResponse)
async def update_collection_item(
    collection_id: int,
    collection_update: CollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a collection item"""
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()

    if not collection:
        raise NotFoundException("Collection item", collection_id)

    if collection.owner_id != current_user.id:
        raise AuthorizationException("You can only edit your own collection")

    for field, value in collection_update.model_dump(exclude_unset=True).items():
        setattr(collection, field, value)

    await db.commit()
    await db.refresh(collection)

    return collection


@router.delete("/collection/{collection_id}")
async def delete_collection_item(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a collection item"""
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()

    if not collection:
        raise NotFoundException("Collection item", collection_id)

    if collection.owner_id != current_user.id:
        raise AuthorizationException("You can only delete your own collection items")

    await db.delete(collection)
    await db.commit()

    return {"message": "Collection item deleted successfully"}
