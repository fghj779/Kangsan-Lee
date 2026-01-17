# Football Jersey Community & Marketplace App

## Overview
A mobile-first community and marketplace app inspired by Korean "레사모" (football jersey communities), combining strong community interaction with a trust-based resale marketplace.

## Core Philosophy
- **Community First**: Trust and reputation over speed and commerce
- **Forum-Style**: Text-heavy discussions, chronological posts
- **Authentication Focus**: "Real or Fake?" verification discussions
- **No Hype Culture**: Anti-flip marketplace, long-term value over quick sales
- **Fan Culture**: Serious collectors, not influencer-driven

## Tech Stack

### Backend (FastAPI + PostgreSQL)
- **FastAPI**: Modern async Python web framework
- **SQLAlchemy**: Async ORM with comprehensive models
- **PostgreSQL**: Relational database
- **Pydantic**: Request/response validation
- **JWT**: Secure authentication

### Mobile (React Native + Expo)
- **React Native**: Cross-platform (iOS/Android)
- **Expo**: Development platform
- **React Navigation**: Stack + Bottom Tabs
- **TypeScript**: Type-safe development
- **Axios**: API communication

## Features Implemented

### 1. Backend Database Models
✅ **User Model** (`backend/app/models/user.py`)
- Roles: Collector, Seller, Buyer, Moderator, Admin
- Profile: bio, avatar, location
- Community stats: contribution_score, total_posts, total_verifications
- Relationships: listings, posts, transactions, reputation

✅ **Board & Post Models** (`backend/app/models/board.py`)
- Board types: Club Discussion, Season Kit, Match Worn, Authenticity, General
- Post categories: Discussion, Review, Verification, Question, News
- Comment system with threading support
- User favorite clubs

✅ **Listing Model** (`backend/app/models/listing.py`)
- Jersey details: club, season, version (replica/player issue/match worn)
- Condition tracking
- Provenance and authenticity verification
- Offer/negotiation system
- Transaction tracking
- Collection showcase (separate from sales)

✅ **Reputation Model** (`backend/app/models/reputation.py`)
- Reputation types: Transaction, Community, Verification
- Ratings: Positive, Neutral, Negative
- Text-based feedback (not just stars)
- Verification request system

### 2. Backend API Endpoints

✅ **Authentication** (`backend/app/api/v1/endpoints/auth.py`)
- POST `/auth/register` - User registration
- POST `/auth/login` - User login
- POST `/auth/refresh` - Token refresh

✅ **Community Boards** (`backend/app/api/v1/endpoints/boards.py`)
- GET `/boards` - List boards with filtering
- GET `/boards/{id}` - Get specific board
- POST `/boards` - Create board (moderator only)
- GET `/boards/{id}/posts` - Get posts with pinned priority
- POST `/posts` - Create post
- PUT `/posts/{id}` - Edit post (author only)
- DELETE `/posts/{id}` - Delete post (author/moderator)
- GET `/posts/{id}/comments` - Get comments
- POST `/comments` - Create comment
- PUT `/comments/{id}` - Edit comment
- DELETE `/comments/{id}` - Delete comment

✅ **Marketplace** (`backend/app/api/v1/endpoints/listings.py`)
- GET `/listings` - Search/filter listings (club, season, version, price, condition)
- GET `/listings/{id}` - Get listing details
- POST `/listings` - Create listing
- PUT `/listings/{id}` - Update listing (seller only)
- DELETE `/listings/{id}` - Delete listing
- GET `/listings/{id}/offers` - View offers (seller sees all, buyers see own)
- POST `/offers` - Make an offer
- PUT `/offers/{id}` - Accept/reject/withdraw offer
- GET `/users/{id}/collection` - View user collection
- POST `/collection` - Add to collection
- PUT `/collection/{id}` - Update collection item
- DELETE `/collection/{id}` - Remove from collection

✅ **Reputation** (`backend/app/api/v1/endpoints/reputation.py`)
- GET `/users/{id}/reputation` - Get user reputation
- GET `/users/{id}/reputation/summary` - Reputation statistics
- POST `/reputation` - Leave feedback
- GET `/verification-requests` - View verification requests
- POST `/verification-requests` - Request verification
- PUT `/verification-requests/{id}` - Verify item (experienced users)

### 3. Mobile App UI

✅ **Navigation Structure** (`mobile/src/navigation/AppNavigator.tsx`)
- Auth Stack: Login, Register
- Bottom Tabs: Community, Marketplace, Profile
- Nested Stacks for each tab

✅ **Dark Theme** (`mobile/src/theme/colors.ts`)
- Background: #1a1a1a
- Cards: #2a2a2a
- Primary: #00a8ff
- Status colors: Success, Warning, Error
- Reputation colors

✅ **Authentication Screens**
- `LoginScreen.tsx` - Email/password login
- `RegisterScreen.tsx` - User registration

✅ **Community Screens**
- `CommunityScreen.tsx` - Board list with search
- `BoardDetailScreen.tsx` - Posts list with categories
- Post categories with color coding
- Pinned posts support

✅ **Marketplace Screens**
- `MarketplaceScreen.tsx` - Listing feed with filters
- Jersey version badges (replica, player issue, match worn)
- Condition indicators
- Seller reputation display
- Negotiable price indicator

✅ **Profile Screens**
- `ProfileScreen.tsx` - User profile showcase
- Favorite clubs display
- Reputation breakdown (positive/neutral/negative)
- Community contribution stats (posts, verifications, score)
- Collection count

## Key Design Decisions

### Trust-Based Marketplace
- **No Instant Buy**: Offer/negotiation system encourages communication
- **Provenance Required**: Listings must include purchase source
- **Community Verification**: Users can request authenticity checks
- **Seller Reputation**: Visible on every listing
- **Long-Term Activity**: Contribution score weights historical activity

### Forum-First Community
- **Chronological Posts**: No algorithmic feed
- **Text-Heavy**: Encourages detailed discussions
- **Category System**: Discussion, Review, Verification, Question, News
- **Club-Specific Boards**: Dedicated spaces for each team
- **Pinned Posts**: Important discussions stay visible

### Anti-Hype Culture
- **No Flip Tools**: No price tracking or market analysis
- **Negotiation Over Speed**: Encourages fair deals
- **Collection Showcase**: Items not for sale can be displayed
- **Community Moderation**: Elected/reputation-based moderators

### Mobile-First UX
- **Dark Mode Default**: Football fan culture preference
- **Clean Card Layouts**: Easy to scan and read
- **Icon-Driven Navigation**: Intuitive bottom tabs
- **Minimal Gamification**: Reputation feels earned, not artificial

## Error Handling

The app includes comprehensive error handling:
- Custom exception classes
- User-friendly error messages
- Network error detection
- Token refresh mechanism
- Input validation
- Database transaction safety
- Logging and monitoring

## Future Enhancements

Potential features for future development:
1. **Real-time Chat**: Direct messaging between buyers/sellers
2. **Image Upload**: Photo hosting for listings and collections
3. **Payment Integration**: Escrow-style transaction system
4. **Push Notifications**: New offers, comments, verifications
5. **Advanced Search**: Filters by manufacturer, size, player
6. **Verification Badges**: Official authenticators
7. **Community Events**: Kit swaps, meetups
8. **Translation**: Multi-language support (Korean, English, Spanish)

## Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```
API available at: http://localhost:8000
API Docs: http://localhost:8000/api/docs

### Mobile
```bash
cd mobile
npm install
npm start
```

## Project Structure
```
/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/      # API routes
│   │   ├── core/                  # Config, database, security
│   │   ├── middleware/            # Error handling
│   │   ├── models/                # SQLAlchemy models
│   │   └── schemas/               # Pydantic schemas
│   └── requirements.txt
│
└── mobile/
    ├── src/
    │   ├── navigation/            # App navigation
    │   ├── screens/               # UI screens
    │   │   ├── auth/
    │   │   ├── community/
    │   │   ├── marketplace/
    │   │   └── profile/
    │   ├── services/              # API & auth services
    │   ├── theme/                 # Colors & styling
    │   └── utils/                 # Error handling
    ├── App.tsx
    └── package.json
```

## License
Built for football jersey collectors worldwide.
