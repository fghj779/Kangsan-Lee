# SportOnboard - Product Requirements Document

## Executive Summary

**SportOnboard** is an intelligent onboarding platform that transforms sports newcomers into engaged fans by providing personalized team recommendations, interactive rule learning, and star player discovery across 8 major sports.

### Target Sports
- NBA (Basketball)
- Soccer (Premier League, La Liga, etc.)
- MLB (Baseball)
- Formula 1
- NFL (American Football)
- Cricket (International, IPL)
- Tennis (ATP/WTA)
- NHL (Hockey)

## Core Value Propositions

1. **Attraction Phase**: Engaging content showcasing the excitement of each sport
2. **Team Selection**: Data-driven recommendations based on user preferences and behavior
3. **Star Discovery**: Narrative-driven player profiles highlighting playstyles and achievements
4. **Rule Mastery**: Interactive visualizations making complex rules intuitive
5. **Personalization**: Hybrid recommender adapting to user interactions

## User Flows

### Flow 1: New User Onboarding
```
1. Landing Page → "Start Your Sports Journey"
2. Sport Interest Selection (multi-select, browse cards)
3. Onboarding Quiz:
   - What excites you? (fast-paced, strategic, team vs individual)
   - Region/Timezone (affects match times)
   - Playstyle preferences (offensive, defensive, underdog, dominant)
   - Favorite sports moments (via video clips)
4. Processing → Team Recommendations
5. Top 5 Teams with Explanations:
   - "Dallas Mavericks - Because you love fast-paced offense"
   - "Real Madrid - Historic club matching your love for dominance"
6. Follow Teams → Dashboard
```

### Flow 2: Learning Rules
```
1. Dashboard → "Learn the Rules" section
2. Sport Selection (e.g., Soccer)
3. Interactive Rule Cards:
   - Offside Rule → SVG visualization with draggable players
   - Penalty Situations → Click scenarios
   - VAR Process → Animated flow
4. Mini-Quiz → Score & Badge
5. Rule Mastery Progress Tracker
```

### Flow 3: Star Discovery
```
1. Dashboard/Sport Page → "Meet the Stars"
2. Player Grid (filtered by sport/position)
3. Player Profile Page:
   - Hero Video/Image
   - "Why Fans Love [Player]" narrative
   - Playstyle Tags (Sniper, Playmaker, Defensive Wall)
   - Career Highlights Timeline
   - Statistics Dashboard
   - "Similar Players You Might Like"
4. Follow Player → Personalized Feed Updates
```

### Flow 4: Team Exploration
```
1. Sport Page → Team List (with filters)
2. Team Profile:
   - Visual identity (colors, logo, stadium)
   - "Team Story" narrative
   - Key Players
   - Recent Performance
   - Match Schedule
   - Fan Culture highlights
3. Compare Teams (side-by-side)
4. Follow Team → Dashboard
```

### Flow 5: Engagement Loop
```
Continuous:
- View content → Track dwell time
- Like/Share → Implicit feedback
- Quiz participation → Preference learning
- Follow actions → Graph building
- Return visits → Recommendation refinement
```

## Key Features

### 1. Hybrid Recommender System
- **Content-Based**: Match user preferences to team attributes (playstyle, region, success_level)
- **Collaborative-Lite**: "Users who liked X also liked Y" (implicit feedback)
- **Contextual**: Timezone compatibility, language, rivalry awareness
- **Explainable**: Every recommendation includes reasoning

### 2. Interactive Rule Visualizations
Required implementations:
- **Soccer Offside**: SVG with movable players showing legal/illegal positions
- **Baseball Strike Zone**: Canvas showing pitch locations with real-time feedback
- **Basketball 3-Point/Shot Clock**: Interactive court with shot clock pressure simulation

Optional additions:
- **F1 Flags & Penalties**: Flag meaning quiz with race scenarios
- **Cricket LBW (Leg Before Wicket)**: 3D ball trajectory visualization
- **NFL Downs System**: Play progression simulator
- **Tennis Scoring**: Love-15-30-40-Game-Set-Match interactive explainer
- **Hockey Icing/Offside**: Rink diagram with play scenarios

### 3. Star Player Narratives
Each player page includes:
- **Hero Section**: Action photo + quick stats
- **The Story**: 2-3 paragraph narrative (journey, defining moments, impact)
- **Playstyle Tags**: Visual tags (Clutch Performer, Speed Demon, Tactician)
- **Career Highlights**: Timeline with video/image links
- **Stats Dashboard**: Key metrics visualized
- **Fan Quotes**: Why supporters love them
- **Recommendation Engine**: "If you like [Player], try [Similar Player]"

### 4. Onboarding Quiz
Questions:
1. **Sports Interest** (multi-select with visual cards)
2. **What Excites You?**
   - Speed & athleticism
   - Strategy & tactics
   - Team chemistry
   - Individual brilliance
   - Underdog stories
   - Historic rivalries
3. **Preferred Pace**: Fast (F1, NBA) vs Methodical (Baseball, Cricket)
4. **Team Personality**: Dominant vs Underdog vs Balanced
5. **Region/Timezone**: Match time preferences
6. **Visual Moment Selection**: Show 8 iconic sports clips, user picks 3 favorites

Scoring:
- Map answers to team attributes (offensive_rating, fanbase_size, underdog_score)
- Weight recent interactions (if returning user)
- Generate top 5 teams across all selected sports

### 5. User Interaction Tracking
Events stored:
- `VIEW`: Page views with dwell_time (>5s = meaningful)
- `LIKE`: Explicit positive signal (weight: 1.5x)
- `FOLLOW`: Strong commitment signal (weight: 3x)
- `SHARE`: Amplification signal (weight: 2x)
- `QUIZ_ANSWER`: Preference data (mapped to attributes)
- `NAVIGATION`: Click patterns revealing interest

## Data Model Overview

### Core Entities
- **Sports**: name, category, complexity_level
- **Leagues**: sport, region, tier
- **Teams**: league, attributes (playstyle, success_metrics, fanbase_region)
- **Players**: team, position, playstyle_tags, narrative_content
- **Rules**: sport, title, difficulty, interactive_config (JSON for visualization params)
- **Users**: anonymous initially, progressive profiling
- **Interactions**: user, entity_type, entity_id, interaction_type, metadata

### Recommender Support
- **TeamAttributes**: Vectorized features for similarity computation
- **UserPreferences**: Derived from quiz + interactions
- **InteractionGraph**: User-Team-Player relationships for collaborative filtering

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Visualizations**: SVG (D3.js lite) + HTML5 Canvas
- **State**: React Context + Server Components
- **Animations**: Framer Motion (optional)

### Backend Stack
- **API**: Next.js API Routes (serverless-ready)
- **ORM**: Prisma
- **Database**: PostgreSQL (with JSON columns for flexible attributes)
- **Auth**: NextAuth.js (optional for MVP, can use anonymous sessions)

### Recommender Engine
- **Similarity Computation**: Cosine similarity for content-based
- **Implicit Feedback**: Weighted interaction scoring
- **Diversity**: Ensure recommendations span multiple sports/leagues
- **Explanation Generation**: Template-based reasoning strings

## Success Metrics

### Engagement
- Quiz completion rate > 70%
- Avg. time on player/team pages > 45s
- Rule visualization interaction rate > 50%

### Conversion
- Teams followed per user > 2
- Players followed per user > 3
- Return visit rate within 7 days > 40%

### Quality
- Recommendation acceptance (follow) rate > 25%
- Positive feedback (likes) on recommendations > 30%

## MVP Scope

### In Scope
- 8 sports with seed data (5-10 teams each, 20+ players per sport)
- Full onboarding quiz (6 questions)
- 3+ interactive rule visualizations
- Hybrid recommender with explanations
- Player narratives (templated with real data)
- Team pages with culture highlights
- Interaction tracking and analytics foundation

### Out of Scope (Post-MVP)
- Real-time score updates
- Social features (user-to-user)
- Live chat/forums
- Video hosting (use YouTube embeds)
- Mobile native apps (responsive web only)
- Advanced ML models (use heuristic + simple CF)

## Development Phases

### Phase 1: Foundation (Current)
- Project setup, data model, seed scripts
- Basic UI shell, routing

### Phase 2: Core Features
- Quiz flow + recommender
- Rule visualizations
- Player/team pages

### Phase 3: Polish
- Interactions tracking
- Analytics dashboard
- Testing + documentation

## User Stories

1. **As a newcomer to basketball**, I want to discover which NBA team matches my personality so I can start following them confidently.

2. **As someone confused by cricket rules**, I want to see interactive explanations of LBW so I can understand the game better.

3. **As a casual sports fan**, I want to learn about star players through engaging stories so I can appreciate their impact beyond stats.

4. **As a user in timezone GMT+8**, I want team recommendations that consider match times so I can actually watch games live.

5. **As an admin**, I want to seed the database with sports data so the app has content without manual entry.

## Future Enhancements
- Match calendar integration
- Notification system for followed teams
- Fantasy sports integration
- Community predictions and polls
- AR rule visualizations (mobile)
- Multi-language support
