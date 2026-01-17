"""
Board and community discussion endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import List, Optional

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.board import Board, Post, Comment
from app.schemas.board import (
    BoardCreate, BoardUpdate, BoardResponse,
    PostCreate, PostUpdate, PostResponse,
    CommentCreate, CommentUpdate, CommentResponse
)
from app.core.exceptions import NotFoundException, ValidationException, AuthorizationException

router = APIRouter()


# Board Endpoints
@router.get("/boards", response_model=List[BoardResponse])
async def get_boards(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    board_type: Optional[str] = None,
    club_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get list of boards with optional filtering"""
    query = select(Board).where(Board.is_active == True)

    if board_type:
        query = query.where(Board.board_type == board_type)
    if club_name:
        query = query.where(Board.club_name.ilike(f"%{club_name}%"))

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    boards = result.scalars().all()

    return boards


@router.get("/boards/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific board by ID"""
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalar_one_or_none()

    if not board:
        raise NotFoundException("Board", board_id)

    return board


@router.post("/boards", response_model=BoardResponse)
async def create_board(
    board: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new board (moderator/admin only)"""
    if current_user.role not in ["moderator", "admin"]:
        raise AuthorizationException("Only moderators and admins can create boards")

    # Check if slug already exists
    result = await db.execute(select(Board).where(Board.slug == board.slug))
    if result.scalar_one_or_none():
        raise ValidationException("A board with this slug already exists", field="slug")

    new_board = Board(**board.model_dump())
    db.add(new_board)
    await db.commit()
    await db.refresh(new_board)

    return new_board


# Post Endpoints
@router.get("/boards/{board_id}/posts", response_model=List[PostResponse])
async def get_board_posts(
    board_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get posts for a specific board"""
    query = select(Post).where(
        Post.board_id == board_id,
        Post.is_deleted == False
    )

    if category:
        query = query.where(Post.category == category)

    # Pinned posts first, then by creation date
    query = query.order_by(desc(Post.is_pinned), desc(Post.created_at))
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    posts = result.scalars().all()

    # Enrich with author info and comment count
    enriched_posts = []
    for post in posts:
        # Get author info
        author_result = await db.execute(
            select(User).where(User.id == post.author_id)
        )
        author = author_result.scalar_one_or_none()

        # Get comment count
        comment_count_result = await db.execute(
            select(func.count(Comment.id)).where(
                Comment.post_id == post.id,
                Comment.is_deleted == False
            )
        )
        comment_count = comment_count_result.scalar()

        post_dict = {
            **post.__dict__,
            "author_username": author.username if author else None,
            "author_avatar": author.avatar_url if author else None,
            "comment_count": comment_count
        }
        enriched_posts.append(PostResponse(**post_dict))

    return enriched_posts


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific post by ID and increment view count"""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post or post.is_deleted:
        raise NotFoundException("Post", post_id)

    # Increment view count
    post.views_count += 1
    await db.commit()
    await db.refresh(post)

    # Get author info
    author_result = await db.execute(select(User).where(User.id == post.author_id))
    author = author_result.scalar_one_or_none()

    # Get comment count
    comment_count_result = await db.execute(
        select(func.count(Comment.id)).where(
            Comment.post_id == post.id,
            Comment.is_deleted == False
        )
    )
    comment_count = comment_count_result.scalar()

    post_dict = {
        **post.__dict__,
        "author_username": author.username if author else None,
        "author_avatar": author.avatar_url if author else None,
        "comment_count": comment_count
    }

    return PostResponse(**post_dict)


@router.post("/posts", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new post"""
    # Verify board exists
    result = await db.execute(select(Board).where(Board.id == post.board_id))
    board = result.scalar_one_or_none()

    if not board:
        raise NotFoundException("Board", post.board_id)

    new_post = Post(
        **post.model_dump(),
        author_id=current_user.id
    )

    db.add(new_post)

    # Update board post count
    board.total_posts += 1

    # Update user post count
    current_user.total_posts += 1

    await db.commit()
    await db.refresh(new_post)

    post_dict = {
        **new_post.__dict__,
        "author_username": current_user.username,
        "author_avatar": current_user.avatar_url,
        "comment_count": 0
    }

    return PostResponse(**post_dict)


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a post (author only)"""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post or post.is_deleted:
        raise NotFoundException("Post", post_id)

    if post.author_id != current_user.id:
        raise AuthorizationException("You can only edit your own posts")

    # Update fields
    for field, value in post_update.model_dump(exclude_unset=True).items():
        setattr(post, field, value)

    await db.commit()
    await db.refresh(post)

    post_dict = {
        **post.__dict__,
        "author_username": current_user.username,
        "author_avatar": current_user.avatar_url,
        "comment_count": 0
    }

    return PostResponse(**post_dict)


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a post (soft delete)"""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise NotFoundException("Post", post_id)

    if post.author_id != current_user.id and current_user.role not in ["moderator", "admin"]:
        raise AuthorizationException("You can only delete your own posts")

    post.is_deleted = True
    await db.commit()

    return {"message": "Post deleted successfully"}


# Comment Endpoints
@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(
    post_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get comments for a specific post"""
    query = select(Comment).where(
        Comment.post_id == post_id,
        Comment.is_deleted == False
    ).order_by(Comment.created_at)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    comments = result.scalars().all()

    # Enrich with author info
    enriched_comments = []
    for comment in comments:
        author_result = await db.execute(
            select(User).where(User.id == comment.author_id)
        )
        author = author_result.scalar_one_or_none()

        comment_dict = {
            **comment.__dict__,
            "author_username": author.username if author else None,
            "author_avatar": author.avatar_url if author else None
        }
        enriched_comments.append(CommentResponse(**comment_dict))

    return enriched_comments


@router.post("/comments", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new comment on a post or listing"""
    if not comment.post_id and not comment.listing_id:
        raise ValidationException("Comment must be associated with a post or listing")

    new_comment = Comment(
        **comment.model_dump(),
        author_id=current_user.id
    )

    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)

    comment_dict = {
        **new_comment.__dict__,
        "author_username": current_user.username,
        "author_avatar": current_user.avatar_url
    }

    return CommentResponse(**comment_dict)


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a comment (author only)"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment or comment.is_deleted:
        raise NotFoundException("Comment", comment_id)

    if comment.author_id != current_user.id:
        raise AuthorizationException("You can only edit your own comments")

    comment.content = comment_update.content
    await db.commit()
    await db.refresh(comment)

    comment_dict = {
        **comment.__dict__,
        "author_username": current_user.username,
        "author_avatar": current_user.avatar_url
    }

    return CommentResponse(**comment_dict)


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a comment (soft delete)"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise NotFoundException("Comment", comment_id)

    if comment.author_id != current_user.id and current_user.role not in ["moderator", "admin"]:
        raise AuthorizationException("You can only delete your own comments")

    comment.is_deleted = True
    await db.commit()

    return {"message": "Comment deleted successfully"}
