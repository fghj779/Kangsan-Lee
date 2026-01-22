"""
Board API endpoints with comprehensive error handling
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List
import logging

from app.core.database import get_db
from app.core.exceptions import (
    NotFoundException,
    ValidationException,
    AuthorizationException,
    DatabaseException,
)
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.board import Board, Post, Comment, BoardType, PostCategory
from app.schemas.board import (
    BoardCreate,
    BoardUpdate,
    BoardResponse,
    PostCreate,
    PostUpdate,
    PostResponse,
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    FavoriteClubCreate,
    FavoriteClubResponse,
)
from app.models.board import UserFavoriteClub

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/boards", response_model=List[BoardResponse])
async def get_boards(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    board_type: BoardType = Query(None, description="Filter by board type"),
    club_name: str = Query(None, description="Filter by club name"),
    search: str = Query(None, description="Search in board name and description"),
    db: AsyncSession = Depends(get_db),
):
    """Get all boards with filtering and pagination"""
    try:
        query = select(Board).where(Board.is_active == True)

        if board_type:
            query = query.where(Board.board_type == board_type)

        if club_name:
            query = query.where(Board.club_name.ilike(f"%{club_name}%"))

        if search:
            query = query.where(
                or_(
                    Board.name.ilike(f"%{search}%"),
                    Board.description.ilike(f"%{search}%"),
                )
            )

        query = query.order_by(Board.total_posts.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        boards = result.scalars().all()

        return boards

    except Exception as e:
        logger.error(f"Error fetching boards: {str(e)}")
        raise DatabaseException("Failed to fetch boards")


@router.post("/boards", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    board_data: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new board (moderators only)"""
    try:
        if current_user.role not in ["moderator", "admin"]:
            raise AuthorizationException("Only moderators can create boards")

        # Check if slug already exists
        result = await db.execute(select(Board).where(Board.slug == board_data.slug))
        if result.scalar_one_or_none():
            raise ValidationException(
                f"A board with slug '{board_data.slug}' already exists",
                field="slug"
            )

        board = Board(**board_data.model_dump())
        db.add(board)
        await db.commit()
        await db.refresh(board)

        logger.info(f"Board created: {board.name} by user {current_user.username}")
        return board

    except (ValidationException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating board: {str(e)}")
        raise DatabaseException("Failed to create board")


@router.get("/boards/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a board by ID"""
    try:
        result = await db.execute(
            select(Board).where(Board.id == board_id, Board.is_active == True)
        )
        board = result.scalar_one_or_none()

        if not board:
            raise NotFoundException("Board", board_id)

        return board

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching board {board_id}: {str(e)}")
        raise DatabaseException("Failed to fetch board")


@router.put("/boards/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: int,
    board_data: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a board (moderators only)"""
    try:
        if current_user.role not in ["moderator", "admin"]:
            raise AuthorizationException("Only moderators can update boards")

        result = await db.execute(select(Board).where(Board.id == board_id))
        board = result.scalar_one_or_none()

        if not board:
            raise NotFoundException("Board", board_id)

        update_data = board_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(board, field, value)

        await db.commit()
        await db.refresh(board)

        logger.info(f"Board updated: {board.name} by user {current_user.username}")
        return board

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating board {board_id}: {str(e)}")
        raise DatabaseException("Failed to update board")


# Post endpoints
@router.get("/boards/{board_id}/posts", response_model=List[PostResponse])
async def get_board_posts(
    board_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: PostCategory = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    """Get all posts in a board"""
    try:
        # Verify board exists
        result = await db.execute(select(Board).where(Board.id == board_id))
        if not result.scalar_one_or_none():
            raise NotFoundException("Board", board_id)

        query = select(Post).where(
            Post.board_id == board_id,
            Post.is_deleted == False
        )

        if category:
            query = query.where(Post.category == category)

        query = (
            query.order_by(Post.is_pinned.desc(), Post.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        posts = result.scalars().all()

        # Enrich with author username and comment count
        response_posts = []
        for post in posts:
            author = await db.get(User, post.author_id)
            comment_count = await db.scalar(
                select(func.count(Comment.id)).where(
                    Comment.post_id == post.id,
                    Comment.is_deleted == False
                )
            )

            post_dict = {
                **post.__dict__,
                "author_username": author.username if author else None,
                "comment_count": comment_count or 0,
            }
            response_posts.append(PostResponse.model_validate(post_dict))

        return response_posts

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching posts for board {board_id}: {str(e)}")
        raise DatabaseException("Failed to fetch posts")


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new post"""
    try:
        # Verify board exists
        result = await db.execute(select(Board).where(Board.id == post_data.board_id))
        board = result.scalar_one_or_none()
        if not board:
            raise NotFoundException("Board", post_data.board_id)

        post = Post(
            **post_data.model_dump(),
            author_id=current_user.id
        )
        db.add(post)

        # Update board stats
        board.total_posts += 1

        # Update user stats
        current_user.total_posts += 1
        current_user.contribution_score += 5

        await db.commit()
        await db.refresh(post)

        post_dict = {
            **post.__dict__,
            "author_username": current_user.username,
            "comment_count": 0,
        }

        logger.info(f"Post created: {post.title} by user {current_user.username}")
        return PostResponse.model_validate(post_dict)

    except NotFoundException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating post: {str(e)}")
        raise DatabaseException("Failed to create post")


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a post by ID"""
    try:
        result = await db.execute(
            select(Post).where(Post.id == post_id, Post.is_deleted == False)
        )
        post = result.scalar_one_or_none()

        if not post:
            raise NotFoundException("Post", post_id)

        # Increment view count
        post.views_count += 1
        await db.commit()

        # Enrich with author info
        author = await db.get(User, post.author_id)
        comment_count = await db.scalar(
            select(func.count(Comment.id)).where(
                Comment.post_id == post.id,
                Comment.is_deleted == False
            )
        )

        post_dict = {
            **post.__dict__,
            "author_username": author.username if author else None,
            "comment_count": comment_count or 0,
        }

        return PostResponse.model_validate(post_dict)

    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error fetching post {post_id}: {str(e)}")
        raise DatabaseException("Failed to fetch post")


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a post (author or moderator only)"""
    try:
        result = await db.execute(select(Post).where(Post.id == post_id))
        post = result.scalar_one_or_none()

        if not post:
            raise NotFoundException("Post", post_id)

        if post.author_id != current_user.id and current_user.role not in ["moderator", "admin"]:
            raise AuthorizationException("You don't have permission to edit this post")

        update_data = post_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(post, field, value)

        await db.commit()
        await db.refresh(post)

        author = await db.get(User, post.author_id)
        comment_count = await db.scalar(
            select(func.count(Comment.id)).where(Comment.post_id == post.id)
        )

        post_dict = {
            **post.__dict__,
            "author_username": author.username if author else None,
            "comment_count": comment_count or 0,
        }

        return PostResponse.model_validate(post_dict)

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating post {post_id}: {str(e)}")
        raise DatabaseException("Failed to update post")


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a post (author or moderator only)"""
    try:
        result = await db.execute(select(Post).where(Post.id == post_id))
        post = result.scalar_one_or_none()

        if not post:
            raise NotFoundException("Post", post_id)

        if post.author_id != current_user.id and current_user.role not in ["moderator", "admin"]:
            raise AuthorizationException("You don't have permission to delete this post")

        post.is_deleted = True
        await db.commit()

        logger.info(f"Post deleted: {post.title} by user {current_user.username}")
        return None

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting post {post_id}: {str(e)}")
        raise DatabaseException("Failed to delete post")


# Comment endpoints
@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get all comments for a post"""
    try:
        result = await db.execute(
            select(Comment)
            .where(Comment.post_id == post_id, Comment.is_deleted == False)
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
        logger.error(f"Error fetching comments for post {post_id}: {str(e)}")
        raise DatabaseException("Failed to fetch comments")


@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new comment"""
    try:
        # Verify target exists (post or listing)
        if comment_data.post_id:
            result = await db.execute(select(Post).where(Post.id == comment_data.post_id))
            if not result.scalar_one_or_none():
                raise NotFoundException("Post", comment_data.post_id)
        elif comment_data.listing_id:
            from app.models.listing import Listing
            result = await db.execute(select(Listing).where(Listing.id == comment_data.listing_id))
            if not result.scalar_one_or_none():
                raise NotFoundException("Listing", comment_data.listing_id)

        comment = Comment(
            **comment_data.model_dump(),
            author_id=current_user.id
        )
        db.add(comment)

        # Update user contribution score
        current_user.contribution_score += 2

        await db.commit()
        await db.refresh(comment)

        comment_dict = {
            **comment.__dict__,
            "author_username": current_user.username,
            "reply_count": 0,
        }

        return CommentResponse.model_validate(comment_dict)

    except NotFoundException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating comment: {str(e)}")
        raise DatabaseException("Failed to create comment")


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a comment (author only)"""
    try:
        result = await db.execute(select(Comment).where(Comment.id == comment_id))
        comment = result.scalar_one_or_none()

        if not comment:
            raise NotFoundException("Comment", comment_id)

        if comment.author_id != current_user.id:
            raise AuthorizationException("You can only edit your own comments")

        comment.content = comment_data.content
        await db.commit()
        await db.refresh(comment)

        author = await db.get(User, comment.author_id)
        reply_count = await db.scalar(
            select(func.count(Comment.id)).where(Comment.parent_comment_id == comment.id)
        )

        comment_dict = {
            **comment.__dict__,
            "author_username": author.username if author else None,
            "reply_count": reply_count or 0,
        }

        return CommentResponse.model_validate(comment_dict)

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating comment {comment_id}: {str(e)}")
        raise DatabaseException("Failed to update comment")


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a comment (author or moderator only)"""
    try:
        result = await db.execute(select(Comment).where(Comment.id == comment_id))
        comment = result.scalar_one_or_none()

        if not comment:
            raise NotFoundException("Comment", comment_id)

        if comment.author_id != current_user.id and current_user.role not in ["moderator", "admin"]:
            raise AuthorizationException("You don't have permission to delete this comment")

        comment.is_deleted = True
        await db.commit()

        return None

    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting comment {comment_id}: {str(e)}")
        raise DatabaseException("Failed to delete comment")


# Favorite clubs endpoints
@router.post("/favorite-clubs", response_model=FavoriteClubResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite_club(
    club_data: FavoriteClubCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a favorite club to user's profile"""
    try:
        favorite = UserFavoriteClub(
            **club_data.model_dump(),
            user_id=current_user.id
        )
        db.add(favorite)
        await db.commit()
        await db.refresh(favorite)

        return favorite

    except Exception as e:
        await db.rollback()
        logger.error(f"Error adding favorite club: {str(e)}")
        raise DatabaseException("Failed to add favorite club")


@router.get("/users/{user_id}/favorite-clubs", response_model=List[FavoriteClubResponse])
async def get_user_favorite_clubs(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get user's favorite clubs"""
    try:
        result = await db.execute(
            select(UserFavoriteClub)
            .where(UserFavoriteClub.user_id == user_id)
            .order_by(UserFavoriteClub.priority.desc())
        )
        favorites = result.scalars().all()

        return favorites

    except Exception as e:
        logger.error(f"Error fetching favorite clubs for user {user_id}: {str(e)}")
        raise DatabaseException("Failed to fetch favorite clubs")
