"""
Reputation and trust system API endpoints
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List
import logging
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.exceptions import (
    NotFoundException,
    ValidationException,
    AuthorizationException,
    DatabaseException,
)
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.reputation import Reputation, ReputationType
from app.models.listing import Transaction
from app.schemas.reputation import (
    ReputationCreate,
    ReputationResponse,
    ReputationSummary,
    UserProfileResponse,
    UserProfileUpdate,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/users/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed user profile with reputation summary"""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("User", user_id)

        # Calculate reputation summary
        reputation_summary = await calculate_reputation_summary(user, db)

        user_dict = {
            **user.__dict__,
            "reputation_summary": reputation_summary,
        }

        return UserProfileResponse.model_validate(user_dict)

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile {user_id}: {str(e)}")
        raise DatabaseException("Failed to fetch user profile")


@router.put("/users/me/profile", response_model=UserProfileResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile"""
    try:
        update_data = profile_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(current_user, field, value)

        await db.commit()
        await db.refresh(current_user)

        reputation_summary = await calculate_reputation_summary(current_user, db)

        user_dict = {
            **current_user.__dict__,
            "reputation_summary": reputation_summary,
        }

        return UserProfileResponse.model_validate(user_dict)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating profile: {str(e)}")
        raise DatabaseException("Failed to update profile")


@router.get("/users/{user_id}/reputation", response_model=List[ReputationResponse])
async def get_user_reputation(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get all reputation feedback for a user"""
    try:
        result = await db.execute(
            select(Reputation)
            .where(Reputation.reviewed_user_id == user_id, Reputation.is_public == True)
            .order_by(Reputation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        reputations = result.scalars().all()

        # Enrich with user info
        response_reputations = []
        for rep in reputations:
            reviewer = await db.get(User, rep.reviewer_id)
            reviewed_user = await db.get(User, rep.reviewed_user_id)

            # Check if transaction verified
            is_verified = False
            if rep.transaction_id:
                transaction = await db.get(Transaction, rep.transaction_id)
                is_verified = transaction and transaction.status == "completed"

            rep_dict = {
                **rep.__dict__,
                "reviewer_username": reviewer.username if reviewer else None,
                "reviewed_user_username": reviewed_user.username if reviewed_user else None,
                "is_verified_transaction": is_verified,
            }
            response_reputations.append(ReputationResponse.model_validate(rep_dict))

        return response_reputations

    except Exception as e:
        logger.error(f"Error fetching reputation for user {user_id}: {str(e)}")
        raise DatabaseException("Failed to fetch reputation")


@router.post("/reputation", response_model=ReputationResponse, status_code=status.HTTP_201_CREATED)
async def create_reputation_feedback(
    reputation_data: ReputationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create reputation feedback for a user after a transaction"""
    try:
        # Verify transaction exists
        transaction = await db.get(Transaction, reputation_data.transaction_id)
        if not transaction:
            raise NotFoundException("Transaction", reputation_data.transaction_id)

        # Verify transaction is completed
        if transaction.status != "completed":
            raise ValidationException("Can only leave feedback for completed transactions")

        # Verify user is part of transaction
        from app.models.listing import Listing
        listing = await db.get(Listing, transaction.listing_id)

        if current_user.id not in [transaction.buyer_id, listing.seller_id]:
            raise AuthorizationException("You are not part of this transaction")

        # Determine who is being reviewed
        if current_user.id == transaction.buyer_id:
            reviewed_user_id = listing.seller_id
        else:
            reviewed_user_id = transaction.buyer_id

        if reputation_data.reviewed_user_id != reviewed_user_id:
            raise ValidationException("Invalid user for this transaction")

        # Check if already reviewed
        result = await db.execute(
            select(Reputation).where(
                and_(
                    Reputation.transaction_id == reputation_data.transaction_id,
                    Reputation.reviewer_id == current_user.id
                )
            )
        )
        if result.scalar_one_or_none():
            raise ValidationException("You have already left feedback for this transaction")

        reputation = Reputation(
            **reputation_data.model_dump(),
            reviewer_id=current_user.id,
            reputation_type=ReputationType.TRANSACTION
        )
        db.add(reputation)
        await db.commit()
        await db.refresh(reputation)

        reviewer = await db.get(User, reputation.reviewer_id)
        reviewed_user = await db.get(User, reputation.reviewed_user_id)

        rep_dict = {
            **reputation.__dict__,
            "reviewer_username": reviewer.username if reviewer else None,
            "reviewed_user_username": reviewed_user.username if reviewed_user else None,
            "is_verified_transaction": True,
        }

        logger.info(f"Reputation created for user {reviewed_user_id} by {current_user.username}")
        return ReputationResponse.model_validate(rep_dict)

    except (NotFoundException, ValidationException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating reputation: {str(e)}")
        raise DatabaseException("Failed to create reputation feedback")


@router.get("/users/{user_id}/reputation-summary", response_model=ReputationSummary)
async def get_reputation_summary(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get comprehensive reputation summary for a user"""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("User", user_id)

        summary = await calculate_reputation_summary(user, db)

        return summary

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error calculating reputation summary for user {user_id}: {str(e)}")
        raise DatabaseException("Failed to calculate reputation summary")


async def calculate_reputation_summary(user: User, db: AsyncSession) -> ReputationSummary:
    """Calculate comprehensive reputation metrics for a user"""
    try:
        # Get all ratings received
        ratings_result = await db.execute(
            select(Reputation).where(Reputation.reviewed_user_id == user.id)
        )
        ratings = ratings_result.scalars().all()

        total_ratings = len(ratings)
        if total_ratings > 0:
            average_rating = sum(r.rating for r in ratings) / total_ratings
            positive_count = sum(1 for r in ratings if r.rating >= 4)
            positive_percentage = (positive_count / total_ratings) * 100
        else:
            average_rating = 0.0
            positive_percentage = 0.0

        # Get total transactions
        from app.models.listing import Listing

        # As seller
        seller_listings_result = await db.execute(
            select(func.count(Transaction.id))
            .join(Listing)
            .where(Listing.seller_id == user.id, Transaction.status == "completed")
        )
        seller_transactions = seller_listings_result.scalar() or 0

        # As buyer
        buyer_transactions_result = await db.execute(
            select(func.count(Transaction.id))
            .where(Transaction.buyer_id == user.id, Transaction.status == "completed")
        )
        buyer_transactions = buyer_transactions_result.scalar() or 0

        total_transactions = seller_transactions + buyer_transactions

        # Calculate account age in days
        account_age_days = (datetime.utcnow() - user.created_at.replace(tzinfo=None)).days

        # Calculate trust score (0-100)
        trust_score = calculate_trust_score(
            average_rating=average_rating,
            total_ratings=total_ratings,
            total_transactions=total_transactions,
            account_age_days=account_age_days,
            contribution_score=user.contribution_score,
            total_posts=user.total_posts,
            total_verifications=user.total_verifications,
        )

        return ReputationSummary(
            user_id=user.id,
            username=user.username,
            average_rating=round(average_rating, 2),
            total_ratings=total_ratings,
            total_transactions=total_transactions,
            positive_feedback_percentage=round(positive_percentage, 1),
            contribution_score=user.contribution_score,
            account_age_days=account_age_days,
            total_posts=user.total_posts,
            total_verifications=user.total_verifications,
            trust_score=round(trust_score, 1),
        )

    except Exception as e:
        logger.error(f"Error calculating reputation summary: {str(e)}")
        raise


def calculate_trust_score(
    average_rating: float,
    total_ratings: int,
    total_transactions: int,
    account_age_days: int,
    contribution_score: int,
    total_posts: int,
    total_verifications: int,
) -> float:
    """
    Calculate overall trust score (0-100) based on multiple factors

    Weights:
    - Average rating: 30%
    - Transaction history: 25%
    - Account age: 15%
    - Community contribution: 30%
    """
    # Rating score (0-100)
    rating_score = (average_rating / 5.0) * 100

    # Transaction score (0-100) - logarithmic scale
    if total_transactions == 0:
        transaction_score = 0
    else:
        transaction_score = min(100, (total_transactions / 50) * 100)

    # Account age score (0-100)
    age_score = min(100, (account_age_days / 365) * 100)

    # Community score (0-100)
    community_score = min(
        100,
        (contribution_score / 1000) * 50 + (total_posts / 100) * 30 + (total_verifications / 50) * 20
    )

    # Weighted average
    trust_score = (
        rating_score * 0.30 +
        transaction_score * 0.25 +
        age_score * 0.15 +
        community_score * 0.30
    )

    return trust_score
