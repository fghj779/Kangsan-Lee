# Football Jersey Community & Marketplace App

A comprehensive mobile-first community and marketplace platform for football jersey collectors, inspired by Korean football jersey communities (레사모).

## 🎯 Core Concept

This app combines strong community interaction with a trust-based resale marketplace, prioritizing authenticity, reputation, and fan culture over pure commerce.

### Key Principles

- **Community First**: Discussion and engagement take priority over transactions
- **Trust-Based**: Reputation and long-term community value matter more than speed
- **Authenticity Focus**: Verification and provenance are core features
- **Forum-Style**: Text-heavy discussions encouraged, chronological feeds prioritized
- **Dark Mode Optimized**: Designed for football fan culture preferences

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL)

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py              # Configuration and settings
│   │   ├── database.py            # Database connection and session management
│   │   ├── exceptions.py          # Custom exception classes
│   │   └── security.py            # Authentication and password hashing
│   ├── middleware/
│   │   └── error_handler.py       # Global error handling middleware
│   ├── models/
│   │   ├── user.py               # User model with roles and contribution tracking
│   │   ├── board.py              # Board, Post, Comment, UserFavoriteClub models
│   │   ├── listing.py            # Listing, Offer, Transaction, Collection models
│   │   ├── reputation.py         # Reputation and verification models
│   │   └── message.py            # Private messaging models
│   ├── schemas/
│   │   ├── user.py               # User Pydantic schemas
│   │   ├── board.py              # Board and post schemas
│   │   ├── listing.py            # Marketplace schemas
│   │   └── reputation.py         # Reputation schemas
│   ├── api/
│   │   ├── dependencies.py       # Auth dependencies
│   │   └── v1/endpoints/
│   │       ├── auth.py           # Authentication endpoints
│   │       ├── users.py          # User profile endpoints
│   │       ├── boards.py         # Community board endpoints
│   │       ├── listings.py       # Marketplace endpoints
│   │       └── reputation.py     # Reputation system endpoints
│   └── main.py                   # FastAPI application entry point
```

### Mobile App (React Native + Expo)

```
mobile/
├── src/
│   ├── theme/
│   │   ├── colors.ts             # Color palette (dark & light themes)
│   │   └── theme.ts              # Theme configuration
│   ├── context/
│   │   └── ThemeContext.tsx      # Theme state management
│   ├── navigation/
│   │   ├── types.ts              # Navigation type definitions
│   │   ├── RootNavigator.tsx     # Root navigation with auth flow
│   │   └── MainNavigator.tsx     # Main tab and stack navigators
│   ├── services/
│   │   ├── api.ts                # API client with error handling
│   │   ├── authService.ts        # Authentication service
│   │   └── errorHandler.ts       # Error utilities
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── community/
│   │   │   ├── BoardListScreen.tsx
│   │   │   ├── BoardDetailScreen.tsx
│   │   │   ├── PostDetailScreen.tsx
│   │   │   └── CreatePostScreen.tsx
│   │   ├── marketplace/
│   │   │   ├── ListingListScreen.tsx
│   │   │   ├── ListingDetailScreen.tsx
│   │   │   ├── CreateListingScreen.tsx
│   │   │   └── OfferListScreen.tsx
│   │   └── profile/
│   │       ├── ProfileScreen.tsx
│   │       ├── EditProfileScreen.tsx
│   │       ├── CollectionScreen.tsx
│   │       ├── ReputationScreen.tsx
│   │       └── SettingsScreen.tsx
│   └── App.tsx
```

## 🎨 Key Features

### Community Boards
- **Club-Specific Boards**: Dedicated spaces for each football club
- **Season Kit Discussions**: Discuss jersey designs by season
- **Match-Worn Analysis**: Expert discussions on player-issue items
- **Authenticity Verification**: "Real or Fake?" community verification
- **Post Categories**: Discussion, Review, Verification, Question, News

### Marketplace
- **Detailed Listings**:
  - Clear front/back photos (min 1, max 10)
  - Size, season, version (replica/player issue/match worn)
  - Purchase source and provenance
  - Condition ratings (6 levels)

- **Offer/Negotiate System**:
  - No instant buy pressure
  - Comment-based Q&A under each listing
  - Buyer can make offers
  - Seller can accept/reject
  - Transaction escrow-style safety

- **Item Types**:
  - Football jerseys (all versions)
  - Scarves and memorabilia
  - Match-worn items with verification

### Trust & Reputation System
- **Transaction-Based Reputation**:
  - 1-5 star ratings
  - Detailed text feedback required
  - Verified purchase badge

- **Trust Score Calculation** (0-100):
  - Average rating: 30% weight
  - Transaction history: 25% weight
  - Account age: 15% weight
  - Community contribution: 30% weight

- **Community Contribution**:
  - Post creation (+5 points)
  - Comment participation (+2 points)
  - Authenticity verifications (+10 points)
  - Long-term activity weighted more

### User Profiles
- **Public Profile**:
  - Collection showcase
  - Favorite clubs and leagues
  - Reputation summary
  - Transaction history
  - Community contribution score

- **Collection Management**:
  - Personal jersey collection
  - Display order customization
  - Mark items for sale option
  - Notes and provenance tracking

## 🔐 User Roles

1. **Collector**: Showcase collections, write reviews, verify authenticity
2. **Seller**: List items with detailed information
3. **Buyer**: Browse, negotiate, purchase with safety
4. **Moderator**: Community-elected, handle flagging and disputes
5. **Admin**: Platform management

## 🎨 Design Philosophy

### UI/UX Principles
- **Mobile-First**: Optimized for mobile devices
- **Dark Mode Primary**: Default dark theme with light option
- **Clean Layout**: Forum-first, minimal distractions
- **Chronological Feeds**: No algorithmic manipulation
- **Text-Heavy**: Long-form content encouraged
- **No Gamification**: Reputation earned, not manufactured

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust and reliability
- **Success**: Green (#10B981) - Verified items
- **Warning**: Orange (#F59E0B) - Negotiable items
- **Accent**: Purple (#8B5CF6) - Premium features
- **Dark Background**: #0A0E1A - Easy on eyes
- **Surface**: #1A1F2E - Card backgrounds

## 📊 Database Schema

### Core Models

**User**
- Authentication (email, username, password)
- Profile (bio, avatar, location)
- Role and status
- Contribution tracking (posts, verifications, score)
- Relationships: listings, posts, transactions, reputation

**Board**
- Board details (name, type, description)
- Club-specific info
- Stats (total posts, members)
- Moderation settings

**Post**
- Content (title, body, images)
- Category and engagement
- Author and board relationships
- Status (pinned, locked, deleted)

**Listing**
- Item details (club, season, version)
- Jersey specifics (size, player name/number)
- Condition and pricing
- Provenance and authenticity
- Images and status

**Offer**
- Amount and message
- Status (pending, accepted, rejected, withdrawn)
- Linked to listing and buyer

**Transaction**
- Final price and status
- Completion tracking
- Linked to listing and buyer

**Reputation**
- Rating (1-5) and feedback text
- Transaction verification
- Reviewer and reviewed user

**Collection**
- Personal jersey collection items
- Display order and notes
- Sale availability flag

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (if using Alembic)
alembic upgrade head

# Start the server
python -m app.main
```

API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs
- Health: http://localhost:8000/health

### Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=jersey_community

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:19006","http://localhost:8081"]

# App
PROJECT_NAME="Football Jersey Community"
VERSION="1.0.0"
API_V1_STR="/api/v1"
```

## 🎯 What This App Is NOT

- ❌ Not a sneaker hype marketplace
- ❌ Not a fast-flip resale app
- ❌ Not influencer-driven
- ❌ Not algorithm-dominated
- ❌ Not about instant gratification
- ❌ Not focused on pure commerce

## ✅ What This App IS

- ✅ A serious fan forum with marketplace
- ✅ Community trust and reputation focused
- ✅ Long-term value prioritized
- ✅ Text-heavy discussions encouraged
- ✅ Chronological, transparent feeds
- ✅ Authenticity and provenance focused
- ✅ Culture and connection first, commerce second

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users/{id}` - Get user by ID
- `GET /api/v1/users/{id}/profile` - Get detailed user profile

### Boards & Posts
- `GET /api/v1/boards` - List all boards
- `POST /api/v1/boards` - Create board (moderator)
- `GET /api/v1/boards/{id}` - Get board details
- `GET /api/v1/boards/{id}/posts` - Get board posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/{id}` - Get post details
- `PUT /api/v1/posts/{id}` - Update post
- `DELETE /api/v1/posts/{id}` - Delete post

### Comments
- `GET /api/v1/posts/{id}/comments` - Get post comments
- `POST /api/v1/comments` - Create comment
- `PUT /api/v1/comments/{id}` - Update comment
- `DELETE /api/v1/comments/{id}` - Delete comment

### Listings
- `GET /api/v1/listings` - List all listings
- `POST /api/v1/listings` - Create listing
- `GET /api/v1/listings/{id}` - Get listing details
- `PUT /api/v1/listings/{id}` - Update listing
- `DELETE /api/v1/listings/{id}` - Delete listing
- `GET /api/v1/listings/{id}/comments` - Get listing comments

### Offers
- `GET /api/v1/listings/{id}/offers` - Get listing offers
- `POST /api/v1/offers` - Create offer
- `PUT /api/v1/offers/{id}` - Accept/reject offer

### Transactions
- `GET /api/v1/transactions` - Get user transactions
- `PUT /api/v1/transactions/{id}/complete` - Complete transaction

### Collections
- `GET /api/v1/users/{id}/collection` - Get user collection
- `POST /api/v1/collection` - Add to collection
- `PUT /api/v1/collection/{id}` - Update collection item
- `DELETE /api/v1/collection/{id}` - Delete collection item

### Reputation
- `GET /api/v1/users/{id}/reputation` - Get user reputation
- `POST /api/v1/reputation` - Leave feedback
- `GET /api/v1/users/{id}/reputation-summary` - Get reputation summary

## 🛡️ Security Features

- JWT token authentication
- Password hashing with bcrypt
- Token refresh mechanism
- Role-based access control
- Input validation on all endpoints
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration
- Rate limiting (future)

## 🤝 Contributing

When adding features, maintain these principles:
1. Community trust over speed
2. Text-heavy, substantive content
3. No artificial urgency or hype
4. Chronological feeds, no algorithms
5. Reputation earned through long-term participation
6. Authenticity and verification priority

## 📄 License

This project demonstrates comprehensive full-stack development with community-first principles for football jersey collectors worldwide.

---

**Built with ❤️ for football fans who value authenticity, community, and culture over hype.**
