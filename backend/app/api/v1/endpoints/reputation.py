"""
Reputation and verification endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.reputation import Reputation, VerificationRequest
from app.models.listing import Transaction, Listing
from app.schemas.reputation import (
    ReputationCreate, ReputationResponse,
    VerificationRequestCreate, VerificationRequestResponse, VerificationUpdate
)
from app.core.exceptions import NotFoundException, ValidationException, AuthorizationException

router = APIRouter()


# Reputation Endpoints
@router.get("/users/{user_id}/reputation", response_model=List[ReputationResponse])
async def get_user_reputation(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    reputation_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get reputation feedback for a user"""
    query = select(Reputation).where(
        Reputation.reviewed_user_id == user_id,
        Reputation.is_public == True
    )

    if reputation_type:
        query = query.where(Reputation.reputation_type == reputation_type)

    query = query.order_by(desc(Reputation.created_at))
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    reputations = result.scalars().all()

    # Enrich with reviewer info
    enriched_reputations = []
    for reputation in reputations:
        reviewer_result = await db.execute(
            select(User).where(User.id == reputation.reviewer_id)
        )
        reviewer = reviewer_result.scalar_one_or_none()

        rep_dict = {
            **reputation.__dict__,
            "reviewer_username": reviewer.username if reviewer else None,
            "reviewer_avatar": reviewer.avatar_url if reviewer else None
        }
        enriched_reputations.append(ReputationResponse(**rep_dict))

    return enriched_reputations


@router.get("/users/{user_id}/reputation/summary")
async def get_user_reputation_summary(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get reputation summary statistics for a user"""
    # Count positive, neutral, negative
    positive_result = await db.execute(
        select(func.count(Reputation.id)).where(
            Reputation.reviewed_user_id == user_id,
            Reputation.rating == "positive"
        )
    )
    positive_count = positive_result.scalar()

    neutral_result = await db.execute(
        select(func.count(Reputation.id)).where(
            Reputation.reviewed_user_id == user_id,
            Reputation.rating == "neutral"
        )
    )
    neutral_count = neutral_result.scalar()

    negative_result = await db.execute(
        select(func.count(Reputation.id)).where(
            Reputation.reviewed_user_id == user_id,
            Reputation.rating == "negative"
        )
    )
    negative_count = negative_result.scalar()

    # Count completed transactions
    transaction_result = await db.execute(
        select(func.count(Transaction.id)).where(
            Transaction.buyer_id == user_id,
            Transaction.status == "completed"
        )
    )
    transaction_count = transaction_result.scalar()

    # Get user contribution score
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    return {
        "user_id": user_id,
        "positive_count": positive_count,
        "neutral_count": neutral_count,
        "negative_count": negative_count,
        "total_feedback": positive_count + neutral_count + negative_count,
        "completed_transactions": transaction_count,
        "contribution_score": user.contribution_score if user else 0,
        "total_posts": user.total_posts if user else 0,
        "total_verifications": user.total_verifications if user else 0,
        "member_since": user.created_at if user else None
    }


@router.post("/reputation", response_model=ReputationResponse)
async def create_reputation(
    reputation: ReputationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create reputation feedback for a user"""
    # Cannot review yourself
    if reputation.reviewed_user_id == current_user.id:
        raise ValidationException("You cannot review yourself")

    # Verify reviewed user exists
    reviewed_user_result = await db.execute(
        select(User).where(User.id == reputation.reviewed_user_id)
    )
    reviewed_user = reviewed_user_result.scalar_one_or_none()

    if not reviewed_user:
        raise NotFoundException("User", reputation.reviewed_user_id)

    # If transaction-based, verify transaction exists and user was involved
    if reputation.transaction_id:
        transaction_result = await db.execute(
            select(Transaction).where(Transaction.id == reputation.transaction_id)
        )
        transaction = transaction_result.scalar_one_or_none()

        if not transaction:
            raise NotFoundException("Transaction", reputation.transaction_id)

        # Check if current user was part of the transaction
        if transaction.buyer_id != current_user.id:
            # Check if current user was the seller
            listing_result = await db.execute(
                select(Listing).where(Listing.id == transaction.listing_id)
            )
            listing = listing_result.scalar_one_or_none()
            if not listing or listing.seller_id != current_user.id:
                raise AuthorizationException("You must be involved in the transaction to leave feedback")

    new_reputation = Reputation(
        **reputation.model_dump(),
        reviewer_id=current_user.id
    )

    db.add(new_reputation)
    await db.commit()
    await db.refresh(new_reputation)

    rep_dict = {
        **new_reputation.__dict__,
        "reviewer_username": current_user.username,
        "reviewer_avatar": current_user.avatar_url
    }

    return ReputationResponse(**rep_dict)


# Verification Request Endpoints
@router.get("/verification-requests", response_model=List[VerificationRequestResponse])
async def get_verification_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = "pending",
    db: AsyncSession = Depends(get_db)
):
    """Get verification requests (for community verification)"""
    query = select(VerificationRequest)

    if status:
        query = query.where(VerificationRequest.status == status)

    query = query.order_by(desc(VerificationRequest.created_at))
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    requests = result.scalars().all()

    # Enrich with requester info
    enriched_requests = []
    for request in requests:
        requester_result = await db.execute(
            select(User).where(User.id == request.requester_id)
        )
        requester = requester_result.scalar_one_or_none()

        verifier = None
        if request.verifier_id:
            verifier_result = await db.execute(
                select(User).where(User.id == request.verifier_id)
            )
            verifier = verifier_result.scalar_one_or_none()

        request_dict = {
            **request.__dict__,
            "requester_username": requester.username if requester else None,
            "verifier_username": verifier.username if verifier else None
        }
        enriched_requests.append(VerificationRequestResponse(**request_dict))

    return enriched_requests


@router.post("/verification-requests", response_model=VerificationRequestResponse)
async def create_verification_request(
    verification: VerificationRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a verification request"""
    import json

    new_verification = VerificationRequest(
        requester_id=current_user.id,
        item_description=verification.item_description,
        image_urls=json.dumps(verification.image_urls),
        listing_id=verification.listing_id
    )

    db.add(new_verification)
    await db.commit()
    await db.refresh(new_verification)

    request_dict = {
        **new_verification.__dict__,
        "requester_username": current_user.username,
        "verifier_username": None
    }

    return VerificationRequestResponse(**request_dict)


@router.put("/verification-requests/{request_id}", response_model=VerificationRequestResponse)
async def update_verification_request(
    request_id: int,
    verification_update: VerificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update verification request (community verifiers)"""
    # Check if user is moderator or has high reputation
    if current_user.role not in ["moderator", "admin"] and current_user.total_verifications < 5:
        raise AuthorizationException("Only experienced community members can verify authenticity")

    result = await db.execute(
        select(VerificationRequest).where(VerificationRequest.id == request_id)
    )
    verification = result.scalar_one_or_none()

    if not verification:
        raise NotFoundException("Verification request", request_id)

    verification.status = verification_update.status
    verification.verification_notes = verification_update.verification_notes
    verification.verifier_id = current_user.id
    verification.verified_at = datetime.utcnow()

    # Update verifier's verification count
    current_user.total_verifications += 1
    current_user.contribution_score += 5  # Award points for verification

    await db.commit()
    await db.refresh(verification)

    request_dict = {
        **verification.__dict__,
        "requester_username": None,
        "verifier_username": current_user.username
    }

    return VerificationRequestResponse(**request_dict)
