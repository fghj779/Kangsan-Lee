# SportOnboard - API Contract

## Base URL
```
Development: http://localhost:3000/api
Production: https://sportonboard.com/api
```

## Authentication
- MVP uses session-based tracking (cookies)
- Optional: Bearer token for future authenticated endpoints
- Header: `X-Session-ID` for anonymous users

## Response Format

### Success Response
```typescript
{
  success: true,
  data: T,
  meta?: {
    page?: number,
    limit?: number,
    total?: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

## API Endpoints

### 1. Sports

#### `GET /api/sports`
Get all available sports.

**Query Parameters:**
- `include_stats` (boolean): Include popularity statistics

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      displayName: string,
      category: string,
      complexityLevel: number,
      description: string,
      imageUrl: string | null,
      popularity: number,
      leagueCount?: number,
      teamCount?: number
    }
  ]
}
```

#### `GET /api/sports/:sportId`
Get single sport with detailed information.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    displayName: string,
    category: string,
    description: string,
    imageUrl: string | null,
    leagues: Array<{
      id: string,
      name: string,
      region: string,
      tier: number
    }>,
    topTeams: Array<TeamSummary>,
    topPlayers: Array<PlayerSummary>,
    rules: Array<RuleSummary>
  }
}
```

---

### 2. Leagues

#### `GET /api/leagues`
Get leagues with filtering.

**Query Parameters:**
- `sportId` (string): Filter by sport
- `region` (string): Filter by region
- `tier` (number): Filter by tier

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      sportId: string,
      sportName: string,
      region: string,
      tier: number,
      imageUrl: string | null,
      teamCount: number
    }
  ]
}
```

#### `GET /api/leagues/:leagueId/teams`
Get all teams in a league.

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      shortName: string,
      city: string,
      country: string,
      logoUrl: string | null,
      playstyle: string[],
      successLevel: string,
      winRate: number,
      popularityScore: number
    }
  ]
}
```

---

### 3. Teams

#### `GET /api/teams`
Get teams with filtering and search.

**Query Parameters:**
- `leagueId` (string): Filter by league
- `sportId` (string): Filter by sport
- `search` (string): Search by name
- `successLevel` (string): "dominant" | "competitive" | "mid" | "underdog"
- `playstyle` (string): Filter by playstyle tag
- `limit` (number): Results per page (default: 20)
- `page` (number): Page number (default: 1)

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      shortName: string,
      city: string,
      country: string,
      logoUrl: string | null,
      primaryColor: string | null,
      league: {
        id: string,
        name: string,
        sportName: string
      },
      playstyle: string[],
      successLevel: string,
      fanbaseSize: string,
      popularityScore: number,
      playerCount: number
    }
  ],
  meta: {
    page: number,
    limit: number,
    total: number
  }
}
```

#### `GET /api/teams/:teamId`
Get detailed team information.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    shortName: string,
    city: string,
    country: string,
    foundedYear: number | null,
    logoUrl: string | null,
    primaryColor: string | null,
    secondaryColor: string | null,
    stadiumName: string | null,
    league: {
      id: string,
      name: string,
      sport: {
        id: string,
        name: string,
        displayName: string
      }
    },
    playstyle: string[],
    fanbaseRegions: string[],
    successLevel: string,
    fanbaseSize: string,
    story: string | null,
    culture: string | null,
    winRate: number,
    popularityScore: number,
    players: Array<{
      id: string,
      displayName: string,
      position: string,
      jerseyNumber: number | null,
      imageUrl: string | null,
      playstyleTags: string[]
    }>,
    similarTeams: Array<{
      id: string,
      name: string,
      logoUrl: string | null,
      similarityScore: number,
      reasons: string[]
    }>
  }
}
```

---

### 4. Players

#### `GET /api/players`
Get players with filtering.

**Query Parameters:**
- `sportId` (string): Filter by sport
- `teamId` (string): Filter by team
- `position` (string): Filter by position
- `search` (string): Search by name
- `limit` (number): Results per page
- `page` (number): Page number

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      displayName: string,
      firstName: string,
      lastName: string,
      position: string,
      jerseyNumber: number | null,
      nationality: string,
      imageUrl: string | null,
      team: {
        id: string,
        name: string,
        logoUrl: string | null
      } | null,
      playstyleTags: string[],
      popularityScore: number
    }
  ],
  meta: { page, limit, total }
}
```

#### `GET /api/players/:playerId`
Get detailed player information.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    displayName: string,
    firstName: string,
    lastName: string,
    position: string,
    jerseyNumber: number | null,
    nationality: string,
    dateOfBirth: string | null,
    height: number | null,
    weight: number | null,
    imageUrl: string | null,
    team: {
      id: string,
      name: string,
      logoUrl: string | null,
      league: {
        id: string,
        name: string,
        sportName: string
      }
    } | null,
    playstyleTags: string[],
    narrative: string | null,
    achievements: Array<{
      year: number,
      title: string,
      description: string
    }>,
    stats: Record<string, number>,
    popularityScore: number,
    similarPlayers: Array<{
      id: string,
      displayName: string,
      imageUrl: string | null,
      similarityScore: number,
      reasons: string[]
    }>
  }
}
```

---

### 5. Rules

#### `GET /api/rules`
Get rules for a sport.

**Query Parameters:**
- `sportId` (string, required): Filter by sport
- `category` (string): "basic" | "intermediate" | "advanced"
- `difficulty` (number): Filter by difficulty level

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      title: string,
      slug: string,
      category: string,
      difficulty: number,
      description: string,
      visualizationType: string | null,
      imageUrl: string | null,
      sportName: string
    }
  ]
}
```

#### `GET /api/rules/:ruleId`
Get detailed rule with visualization config.

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    slug: string,
    category: string,
    difficulty: number,
    description: string,
    explanation: string,
    visualizationType: string | null,
    visualConfig: Record<string, any> | null,
    imageUrl: string | null,
    videoUrl: string | null,
    sport: {
      id: string,
      name: string,
      displayName: string
    }
  }
}
```

---

### 6. User Management

#### `POST /api/users/session`
Create or retrieve user session.

**Request Body:**
```typescript
{
  sessionId?: string, // If returning user
  timezone?: string,
  region?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    userId: string,
    sessionId: string,
    isAnonymous: boolean,
    hasCompletedQuiz: boolean,
    onboardingStep: number
  }
}
```

#### `GET /api/users/me`
Get current user profile and preferences.

**Headers:**
- `X-Session-ID`: Session identifier

**Response:**
```typescript
{
  success: true,
  data: {
    id: string,
    sessionId: string,
    isAnonymous: boolean,
    hasCompletedQuiz: boolean,
    onboardingStep: number,
    timezone: string | null,
    region: string | null,
    preferences: {
      preferredSports: string[],
      preferredPace: string | null,
      preferredStyle: string | null,
      teamPersonality: string | null,
      followedTeamIds: string[],
      excitementFactors: string[]
    } | null
  }
}
```

---

### 7. Quiz & Onboarding

#### `POST /api/quiz/submit`
Submit quiz responses.

**Request Body:**
```typescript
{
  responses: [
    {
      questionId: string,
      answers: any // Flexible based on question type
    }
  ]
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    quizCompleted: true,
    preferencesUpdated: true,
    recommendationsGenerated: true
  }
}
```

#### `GET /api/quiz/questions`
Get onboarding quiz questions.

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: string,
      type: string, // "multi_select", "single_choice", "scale", "media_choice"
      question: string,
      description: string,
      options: Array<{
        id: string,
        label: string,
        value: string,
        imageUrl?: string,
        videoUrl?: string
      }>,
      required: boolean,
      order: number
    }
  ]
}
```

---

### 8. Recommendations

#### `GET /api/recommendations/teams`
Get personalized team recommendations.

**Headers:**
- `X-Session-ID`: Session identifier

**Query Parameters:**
- `limit` (number): Number of recommendations (default: 5)
- `sport` (string): Filter by specific sport

**Response:**
```typescript
{
  success: true,
  data: [
    {
      team: {
        id: string,
        name: string,
        shortName: string,
        logoUrl: string | null,
        league: {
          name: string,
          sportName: string
        },
        playstyle: string[],
        successLevel: string
      },
      score: number, // 0-100 recommendation strength
      reasons: [
        {
          type: string, // "preference_match", "similar_to_liked", "popularity", "regional"
          message: string, // "Because you love fast-paced offense"
          weight: number
        }
      ],
      rank: number
    }
  ]
}
```

#### `GET /api/recommendations/players`
Get personalized player recommendations.

**Response:**
```typescript
{
  success: true,
  data: [
    {
      player: PlayerSummary,
      score: number,
      reasons: Array<ReasonObject>,
      rank: number
    }
  ]
}
```

---

### 9. Interactions

#### `POST /api/interactions`
Track user interaction.

**Request Body:**
```typescript
{
  entityType: "sport" | "league" | "team" | "player" | "rule",
  entityId: string,
  type: "view" | "like" | "follow" | "share" | "click",
  dwellTime?: number, // For views, in seconds
  metadata?: Record<string, any>
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    interactionId: string,
    recorded: true
  }
}
```

#### `GET /api/interactions/stats`
Get user's interaction statistics.

**Response:**
```typescript
{
  success: true,
  data: {
    totalInteractions: number,
    byType: {
      view: number,
      like: number,
      follow: number,
      share: number
    },
    bySport: {
      [sportName: string]: number
    },
    followedTeamsCount: number,
    followedPlayersCount: number
  }
}
```

#### `POST /api/interactions/follow`
Follow/unfollow a team or player.

**Request Body:**
```typescript
{
  entityType: "team" | "player",
  entityId: string,
  action: "follow" | "unfollow"
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    following: boolean
  }
}
```

---

### 10. Search

#### `GET /api/search`
Global search across teams, players, leagues.

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string): Filter by "team" | "player" | "league" | "sport"
- `limit` (number): Results limit (default: 10)

**Response:**
```typescript
{
  success: true,
  data: {
    teams: Array<TeamSummary>,
    players: Array<PlayerSummary>,
    leagues: Array<LeagueSummary>,
    sports: Array<SportSummary>
  }
}
```

---

### 11. Analytics (Admin/Dev)

#### `GET /api/admin/analytics/popular`
Get popular entities by interaction count.

**Query Parameters:**
- `entityType` (string): "team" | "player" | "sport"
- `limit` (number): Top N results

**Response:**
```typescript
{
  success: true,
  data: [
    {
      entity: any,
      interactionCount: number,
      likeCount: number,
      followCount: number,
      viewCount: number
    }
  ]
}
```

---

## Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `INVALID_SESSION` | Invalid session ID | 401 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `QUIZ_INCOMPLETE` | Quiz must be completed first | 403 |
| `RATE_LIMIT` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

---

## Rate Limiting

- **Anonymous users**: 100 requests/minute
- **Authenticated users**: 300 requests/minute
- **Interaction endpoints**: 30 requests/minute (prevent spam)

---

## Caching Strategy

- **Sports/Leagues**: Cache for 1 hour (rarely change)
- **Teams/Players**: Cache for 15 minutes
- **Recommendations**: Cache per user session for 5 minutes
- **Rules**: Cache for 1 day
- **Interactions**: No cache (real-time tracking)

---

## WebSocket Endpoints (Future)

```
ws://localhost:3000/api/ws
```

Real-time updates for:
- Live scores (future)
- Follow notifications
- Recommendation updates

---

## Type Definitions (TypeScript)

```typescript
// Common types used across responses

type TeamSummary = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
  league: {
    name: string;
    sportName: string;
  };
  playstyle: string[];
  successLevel: string;
  popularityScore: number;
};

type PlayerSummary = {
  id: string;
  displayName: string;
  position: string;
  imageUrl: string | null;
  team: {
    name: string;
    logoUrl: string | null;
  } | null;
  playstyleTags: string[];
  popularityScore: number;
};

type LeagueSummary = {
  id: string;
  name: string;
  sportName: string;
  region: string;
  tier: number;
};

type SportSummary = {
  id: string;
  name: string;
  displayName: string;
  imageUrl: string | null;
  popularity: number;
};

type RuleSummary = {
  id: string;
  title: string;
  slug: string;
  difficulty: number;
  visualizationType: string | null;
};

type ReasonObject = {
  type: string;
  message: string;
  weight: number;
};
```
