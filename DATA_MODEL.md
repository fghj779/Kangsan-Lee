# SportOnboard - Data Model Design

## Entity Relationship Overview

```
Sport (1) → (N) League
League (1) → (N) Team
Team (1) → (N) Player
Sport (1) → (N) Rule

User (1) → (N) Interaction
User (1) → (1) UserPreference

Interaction → (Sport | League | Team | Player | Rule)
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ================================
// CORE SPORTS ENTITIES
// ================================

model Sport {
  id               String   @id @default(cuid())
  name             String   @unique // "NBA", "Soccer", "F1", etc.
  displayName      String   // "Basketball", "Football (Soccer)"
  category         String   // "team_sport", "individual_sport", "racing"
  complexityLevel  Int      @default(5) // 1-10 scale
  description      String   @db.Text
  imageUrl         String?
  popularity       Int      @default(50) // 0-100 scale

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  leagues          League[]
  rules            Rule[]
  interactions     Interaction[]

  @@index([popularity])
}

model League {
  id              String   @id @default(cuid())
  sportId         String
  sport           Sport    @relation(fields: [sportId], references: [id], onDelete: Cascade)

  name            String   // "NBA", "Premier League", "La Liga"
  region          String   // "North America", "Europe", "Global"
  tier            Int      @default(1) // 1 = top tier, 2 = second division, etc.
  season          String?  // "2024-25"

  imageUrl        String?
  description     String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  teams           Team[]
  interactions    Interaction[]

  @@unique([sportId, name])
  @@index([sportId, tier])
}

model Team {
  id                String   @id @default(cuid())
  leagueId          String
  league            League   @relation(fields: [leagueId], references: [id], onDelete: Cascade)

  name              String
  shortName         String   // "Lakers", "Real Madrid", "Red Bull Racing"
  city              String?
  country           String
  foundedYear       Int?

  logoUrl           String?
  primaryColor      String?  // Hex color
  secondaryColor    String?
  stadiumName       String?

  // Attributes for recommendation
  playstyle         String[] // ["offensive", "fast_paced", "defensive"]
  fanbaseRegions    String[] // ["North America", "Asia"]
  successLevel      String   @default("mid") // "dominant", "competitive", "mid", "underdog"
  fanbaseSize       String   @default("medium") // "massive", "large", "medium", "small"

  // Narrative content
  story             String?  @db.Text
  culture           String?  @db.Text // Fan culture highlights

  // Metrics for recommendation
  winRate           Float?   @default(0.5)
  popularityScore   Int      @default(50)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  players           Player[]
  interactions      Interaction[]
  userPreferences   UserPreference[]

  @@unique([leagueId, name])
  @@index([leagueId])
  @@index([successLevel])
}

model Player {
  id                String   @id @default(cuid())
  teamId            String?
  team              Team?    @relation(fields: [teamId], references: [id], onDelete: SetNull)

  firstName         String
  lastName          String
  displayName       String   // "LeBron James", "Messi"
  position          String   // Position/role varies by sport
  jerseyNumber      Int?

  nationality       String
  dateOfBirth       DateTime?
  height            Float?   // in cm
  weight            Float?   // in kg

  imageUrl          String?

  // Narrative & personality
  playstyleTags     String[] // ["Sniper", "Playmaker", "Clutch"]
  narrative         String?  @db.Text // "Why fans love them" story
  achievements      Json?    // [{year: 2020, title: "MVP", description: "..."}]

  // Stats (flexible JSON for sport-specific metrics)
  stats             Json?    // {points_per_game: 27.5, assists: 8.2, ...}

  // Recommendation signals
  popularityScore   Int      @default(50)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  interactions      Interaction[]

  @@index([teamId])
  @@index([popularityScore])
}

model Rule {
  id                String   @id @default(cuid())
  sportId           String
  sport             Sport    @relation(fields: [sportId], references: [id], onDelete: Cascade)

  title             String   // "Offside Rule", "Strike Zone"
  slug              String   // "soccer-offside", "baseball-strike-zone"
  category          String   // "basic", "intermediate", "advanced"
  difficulty        Int      @default(5) // 1-10

  description       String   @db.Text
  explanation       String   @db.Text // Detailed explanation

  // Interactive visualization config
  visualizationType String?  // "svg_interactive", "canvas_simulation", "video"
  visualConfig      Json?    // Configuration for the interactive component

  imageUrl          String?
  videoUrl          String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  interactions      Interaction[]

  @@unique([sportId, slug])
  @@index([sportId, difficulty])
}

// ================================
// USER & PREFERENCE SYSTEM
// ================================

model User {
  id                String   @id @default(cuid())

  // Optional authentication (for MVP, can be anonymous sessions)
  email             String?  @unique
  name              String?

  // Session tracking
  sessionId         String?  @unique
  isAnonymous       Boolean  @default(true)

  // Onboarding status
  hasCompletedQuiz  Boolean  @default(false)
  onboardingStep    Int      @default(0)

  // Metadata
  timezone          String?
  region            String?
  language          String   @default("en")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastActiveAt      DateTime @default(now())

  preferences       UserPreference?
  interactions      Interaction[]
  quizResponses     QuizResponse[]

  @@index([sessionId])
  @@index([lastActiveAt])
}

model UserPreference {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Sports interests
  preferredSports   String[] // ["NBA", "Soccer", "F1"]

  // Derived from quiz + interactions
  preferredPace     String?  // "fast", "moderate", "methodical"
  preferredStyle    String?  // "offensive", "defensive", "balanced"
  teamPersonality   String?  // "dominant", "underdog", "balanced"

  // Contextual preferences
  timezone          String?
  regionPreference  String[] // For team recommendations

  // Behavioral attributes (derived from interactions)
  excitementFactors String[] // ["speed", "strategy", "individual_brilliance"]

  // Followed entities
  followedTeams     Team[]

  // Computed preference vector (for similarity matching)
  preferenceVector  Json?    // {offensive: 0.8, defensive: 0.3, fast_paced: 0.9, ...}

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
}

model QuizResponse {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  questionId        String   // "sports_interest", "excitement_factors", etc.
  answers           Json     // Flexible JSON for various answer types

  createdAt         DateTime @default(now())

  @@index([userId])
  @@index([questionId])
}

// ================================
// INTERACTION TRACKING
// ================================

model Interaction {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Polymorphic relationship
  entityType        String   // "sport", "league", "team", "player", "rule"
  entityId          String

  // Explicit relations (for querying)
  sportId           String?
  sport             Sport?   @relation(fields: [sportId], references: [id], onDelete: Cascade)
  leagueId          String?
  league            League?  @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  teamId            String?
  team              Team?    @relation(fields: [teamId], references: [id], onDelete: Cascade)
  playerId          String?
  player            Player?  @relation(fields: [playerId], references: [id], onDelete: Cascade)
  ruleId            String?
  rule              Rule?    @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  // Interaction type
  type              String   // "view", "like", "follow", "share", "quiz_answer", "click"

  // Metadata
  dwellTime         Int?     // in seconds (for views)
  metadata          Json?    // Additional context

  // Signals for recommender
  weight            Float    @default(1.0) // Importance weight

  createdAt         DateTime @default(now())

  @@index([userId, entityType])
  @@index([userId, type])
  @@index([entityType, entityId])
  @@index([createdAt])
}

// ================================
// RECOMMENDATION SUPPORT
// ================================

model TeamSimilarity {
  id                String   @id @default(cuid())

  teamAId           String
  teamBId           String

  similarityScore   Float    // 0-1 cosine similarity

  // Explanation for similarity
  reasons           String[] // ["both_offensive", "same_region", "similar_success"]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([teamAId, teamBId])
  @@index([similarityScore])
}

model PlayerSimilarity {
  id                String   @id @default(cuid())

  playerAId         String
  playerBId         String

  similarityScore   Float
  reasons           String[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([playerAId, playerBId])
  @@index([similarityScore])
}
```

## Key Design Decisions

### 1. Flexible Attributes
- **JSON fields** for `achievements`, `stats`, `visualConfig` allow sport-specific data without schema changes
- **String arrays** for `playstyle`, `playstyleTags` enable multi-tagging

### 2. Polymorphic Interactions
- Single `Interaction` table tracks all user engagement
- `entityType` + `entityId` provides flexibility
- Explicit foreign keys (`sportId`, `teamId`, etc.) enable efficient joins

### 3. Recommender Support
- `TeamSimilarity` and `PlayerSimilarity` cache computed similarities
- `preferenceVector` in `UserPreference` enables fast content-based matching
- `weight` field in `Interaction` allows different signal strengths

### 4. Anonymous Users
- `sessionId` enables tracking before authentication
- `isAnonymous` flag distinguishes user types
- Progressive profiling path from anonymous → authenticated

### 5. Cascading Deletes
- Sport deletion cascades to leagues, teams (via league), rules
- User deletion cascades to preferences, interactions (GDPR-friendly)
- Player team deletion sets `teamId` to null (free agents)

## Indexes Rationale

- **Performance**: Most queries filter by `sportId`, `leagueId`, `teamId`
- **Recommender**: Sorting by `popularityScore`, `similarityScore`
- **Analytics**: Time-based queries on `createdAt`, `lastActiveAt`
- **User lookups**: `sessionId`, `email` for authentication

## Data Volume Estimates (MVP)

- **Sports**: 8
- **Leagues**: ~15 (multiple leagues per sport)
- **Teams**: ~120 (5-10 per league)
- **Players**: ~600 (20-50 per sport)
- **Rules**: ~40 (5 per sport)
- **Users**: 1,000+ (growth target)
- **Interactions**: 10,000+ (high-frequency writes)

## Migration Strategy

1. Initial migration creates all tables
2. Seed script populates Sports → Leagues → Teams → Players → Rules
3. Similarity tables populated via background job post-seed
4. Interactions accumulate in real-time
