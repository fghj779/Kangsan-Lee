# SportOnboard - Recommender System Design

## Overview

SportOnboard uses a **hybrid recommender** combining:
1. **Content-Based Filtering**: Match user preferences to team/player attributes
2. **Collaborative Filtering (Lite)**: Implicit feedback from user interactions
3. **Contextual Filtering**: Region, timezone, language considerations
4. **Explainability Layer**: Generate human-readable reasons for each recommendation

---

## Architecture

```
┌─────────────────┐
│  User Profile   │
│  - Quiz Data    │
│  - Interactions │
│  - Preferences  │
└────────┬────────┘
         │
         ├──────────────────┬────────────────┐
         │                  │                │
         ▼                  ▼                ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Content-Based │  │Collaborative │  │  Contextual  │
│    Scoring     │  │   Scoring    │  │   Scoring    │
└────────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                  │                │
         └──────────────────┼────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Hybrid Score  │
                   │   Aggregation  │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │   Ranking &    │
                   │ Diversification│
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Explanation   │
                   │   Generation   │
                   └────────────────┘
```

---

## 1. Content-Based Filtering

### User Preference Vector

Built from quiz responses and interactions:

```typescript
type PreferenceVector = {
  // Playstyle preferences (0-1 scale)
  offensive: number;
  defensive: number;
  fastPaced: number;
  strategic: number;

  // Team personality (0-1 scale)
  dominant: number;
  underdog: number;

  // Sport-specific weights (0-1 scale)
  sportWeights: {
    [sportName: string]: number;
  };

  // Regional affinity (0-1 scale)
  regionWeights: {
    [region: string]: number;
  };

  // Excitement factors (0-1 scale)
  speed: number;
  teamwork: number;
  individual: number;
  strategy: number;
}
```

### Team Attribute Vector

Each team has a feature vector:

```typescript
type TeamVector = {
  offensive: number;      // 0-1 (derived from playstyle tags)
  defensive: number;      // 0-1
  fastPaced: number;      // 0-1
  strategic: number;      // 0-1

  dominance: number;      // Based on successLevel + winRate
  underdog: number;       // Inverse of dominance

  sportId: string;
  region: string;

  popularityScore: number; // 0-100
  fanbaseSize: number;     // Encoded: massive=4, large=3, medium=2, small=1
}
```

### Similarity Computation

**Cosine Similarity** between user preferences and team attributes:

```
similarity(user, team) = (user · team) / (||user|| × ||team||)

Where:
  user · team = Σ(user[i] × team[i]) for all matching dimensions
  ||user|| = sqrt(Σ(user[i]²))
  ||team|| = sqrt(Σ(team[i]²))
```

**Implementation:**

```typescript
function cosineSimilarity(
  userVector: PreferenceVector,
  teamVector: TeamVector
): number {
  // Extract comparable dimensions
  const dimensions = ['offensive', 'defensive', 'fastPaced', 'strategic'];

  let dotProduct = 0;
  let userMagnitude = 0;
  let teamMagnitude = 0;

  for (const dim of dimensions) {
    const userVal = userVector[dim] || 0;
    const teamVal = teamVector[dim] || 0;

    dotProduct += userVal * teamVal;
    userMagnitude += userVal * userVal;
    teamMagnitude += teamVal * teamVal;
  }

  // Add personality match
  const userDominant = userVector.dominant || 0;
  const userUnderdog = userVector.underdog || 0;
  const teamDominance = teamVector.dominance || 0;
  const teamUnderdog = teamVector.underdog || 0;

  dotProduct += userDominant * teamDominance + userUnderdog * teamUnderdog;
  userMagnitude += userDominant ** 2 + userUnderdog ** 2;
  teamMagnitude += teamDominance ** 2 + teamUnderdog ** 2;

  if (userMagnitude === 0 || teamMagnitude === 0) return 0;

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(teamMagnitude));
}
```

**Content Score Formula:**

```
contentScore = (cosineSim × 0.7) + (sportWeight × 0.2) + (regionMatch × 0.1)

Where:
  cosineSim ∈ [0, 1]
  sportWeight = userVector.sportWeights[team.sport] ∈ [0, 1]
  regionMatch = 1 if team.region matches user preference, else 0.3
```

---

## 2. Collaborative Filtering (Implicit Feedback)

### Interaction Weights

Different interaction types have different signals:

| Interaction Type | Weight | Rationale |
|-----------------|--------|-----------|
| VIEW (>5s dwell) | 1.0 | Basic interest |
| VIEW (>30s dwell) | 1.5 | Strong interest |
| LIKE | 2.0 | Explicit positive |
| FOLLOW | 3.0 | Commitment |
| SHARE | 2.5 | Advocacy |
| QUIZ_ANSWER | 1.5 | Stated preference |

### User-Item Interaction Matrix

Build a sparse matrix of user interactions:

```
        Team1  Team2  Team3  ...
User1    3.0    0      1.5   ...
User2    2.0    3.0    0     ...
User3    0      1.0    3.0   ...
...
```

### Item-Based Collaborative Filtering

For a target user, find teams liked by similar users:

```
collaborativeScore(user, team) = Σ(similarity(user, otherUser) × interaction(otherUser, team))
                                  / Σ(similarity(user, otherUser))
```

**Simplified Approach (MVP):**

Instead of full matrix factorization, use a simpler heuristic:

```typescript
function collaborativeScore(
  userId: string,
  teamId: string,
  interactions: Interaction[]
): number {
  // Find users who interacted with teams the current user liked
  const userLikes = interactions.filter(
    i => i.userId === userId && i.weight >= 2.0
  );

  if (userLikes.length === 0) return 0;

  const likedTeamIds = userLikes.map(i => i.teamId);

  // Find other users who liked the same teams
  const similarUserInteractions = interactions.filter(
    i => i.userId !== userId &&
         likedTeamIds.includes(i.teamId) &&
         i.weight >= 2.0
  );

  const similarUserIds = [...new Set(similarUserInteractions.map(i => i.userId))];

  // Check if these similar users liked the target team
  const targetTeamLikes = interactions.filter(
    i => similarUserIds.includes(i.userId) &&
         i.teamId === teamId &&
         i.weight >= 2.0
  );

  // Score based on number of similar users who liked the target team
  const score = targetTeamLikes.length / Math.max(similarUserIds.length, 1);

  return score; // 0-1 range
}
```

---

## 3. Contextual Filtering

### Timezone Compatibility

Teams in leagues with match times compatible with user's timezone get a boost:

```typescript
function timezoneScore(userTimezone: string, teamRegion: string): number {
  const regionTimezones = {
    'North America': ['America/New_York', 'America/Chicago', 'America/Los_Angeles'],
    'Europe': ['Europe/London', 'Europe/Paris', 'Europe/Berlin'],
    'Asia': ['Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore'],
    // ... more mappings
  };

  const userRegion = getRegionFromTimezone(userTimezone);

  if (userRegion === teamRegion) return 1.0;

  // Adjacent timezones (e.g., US-Europe): 0.6
  if (isAdjacentRegion(userRegion, teamRegion)) return 0.6;

  // Opposite timezones (e.g., US-Asia): 0.3
  return 0.3;
}
```

### Language/Culture Match

```typescript
function culturalAffinityScore(user: User, team: Team): number {
  let score = 0;

  // Same country: +0.5
  if (user.region === team.country) score += 0.5;

  // Fanbase overlap: +0.3
  if (team.fanbaseRegions.includes(user.region)) score += 0.3;

  // Language match (future): +0.2

  return Math.min(score, 1.0);
}
```

---

## 4. Hybrid Score Aggregation

Combine all scores with weighted averaging:

```
finalScore = (contentScore × w1) + (collaborativeScore × w2) +
             (contextualScore × w3) + (popularityScore × w4)

Default weights (MVP):
  w1 = 0.5  (content-based is primary)
  w2 = 0.25 (collaborative is secondary)
  w3 = 0.15 (contextual is tertiary)
  w4 = 0.1  (popularity is a small boost)

popularityScore = team.popularityScore / 100
```

**Implementation:**

```typescript
function computeHybridScore(
  user: User,
  team: Team,
  contentScore: number,
  collaborativeScore: number,
  timezoneScore: number,
  culturalScore: number
): number {
  const contextualScore = (timezoneScore + culturalScore) / 2;
  const popularityScore = team.popularityScore / 100;

  const hybridScore =
    contentScore * 0.5 +
    collaborativeScore * 0.25 +
    contextualScore * 0.15 +
    popularityScore * 0.1;

  return hybridScore; // 0-1 range
}
```

**Scaling to 0-100:**

```typescript
const finalScore = Math.round(hybridScore * 100);
```

---

## 5. Ranking and Diversification

### Ranking

Sort teams by `finalScore` in descending order.

### Diversification

Ensure recommendations span multiple sports and leagues:

```typescript
function diversifyRecommendations(
  rankedTeams: Array<{team: Team, score: number}>,
  topN: number = 5
): Array<{team: Team, score: number}> {
  const diverse: Array<{team: Team, score: number}> = [];
  const usedSports = new Set<string>();
  const usedLeagues = new Set<string>();

  // First pass: Pick top team from each sport
  for (const item of rankedTeams) {
    if (!usedSports.has(item.team.league.sportId)) {
      diverse.push(item);
      usedSports.add(item.team.league.sportId);
      usedLeagues.add(item.team.leagueId);

      if (diverse.length >= topN) break;
    }
  }

  // Second pass: Fill remaining slots with highest scores (different leagues)
  if (diverse.length < topN) {
    for (const item of rankedTeams) {
      if (!usedLeagues.has(item.team.leagueId)) {
        diverse.push(item);
        usedLeagues.add(item.team.leagueId);

        if (diverse.length >= topN) break;
      }
    }
  }

  // Third pass: Fill any remaining with highest scores
  if (diverse.length < topN) {
    for (const item of rankedTeams) {
      if (!diverse.includes(item)) {
        diverse.push(item);
        if (diverse.length >= topN) break;
      }
    }
  }

  return diverse;
}
```

---

## 6. Explanation Generation

Generate human-readable reasons for each recommendation:

```typescript
type RecommendationReason = {
  type: 'preference_match' | 'similar_to_liked' | 'regional' |
        'popularity' | 'timezone' | 'playstyle';
  message: string;
  weight: number; // Contribution to final score
};

function generateExplanations(
  user: User,
  team: Team,
  scores: {
    content: number;
    collaborative: number;
    timezone: number;
    cultural: number;
  }
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];

  // Content-based reasons
  if (scores.content > 0.6) {
    const userPrefs = user.preferences;
    const teamAttrs = team.playstyle;

    // Check playstyle match
    if (userPrefs?.preferredStyle && teamAttrs.includes(userPrefs.preferredStyle)) {
      reasons.push({
        type: 'playstyle',
        message: `Because you love ${userPrefs.preferredStyle} teams`,
        weight: 0.3
      });
    }

    // Check team personality
    if (userPrefs?.teamPersonality === 'underdog' && team.successLevel === 'underdog') {
      reasons.push({
        type: 'preference_match',
        message: `Matches your love for underdog stories`,
        weight: 0.25
      });
    } else if (userPrefs?.teamPersonality === 'dominant' && team.successLevel === 'dominant') {
      reasons.push({
        type: 'preference_match',
        message: `A dominant force matching your preferences`,
        weight: 0.25
      });
    }
  }

  // Collaborative reasons
  if (scores.collaborative > 0.3) {
    reasons.push({
      type: 'similar_to_liked',
      message: `Fans who liked your teams also follow this one`,
      weight: 0.2
    });
  }

  // Regional reasons
  if (scores.cultural > 0.5) {
    reasons.push({
      type: 'regional',
      message: `Popular in your region`,
      weight: 0.15
    });
  }

  // Timezone reasons
  if (scores.timezone > 0.7) {
    reasons.push({
      type: 'timezone',
      message: `Games at convenient times for you`,
      weight: 0.1
    });
  }

  // Popularity (always show if high)
  if (team.popularityScore > 70) {
    reasons.push({
      type: 'popularity',
      message: `One of the most followed teams globally`,
      weight: 0.1
    });
  }

  // Sort by weight and return top 3
  return reasons.sort((a, b) => b.weight - a.weight).slice(0, 3);
}
```

**Example Output:**

```
Dallas Mavericks (Score: 87)
  ✓ Because you love fast-paced teams
  ✓ Matches your love for offensive play
  ✓ Games at convenient times for you
```

---

## 7. Quiz Scoring

Convert quiz answers to preference vector:

```typescript
function quizToPreferenceVector(responses: QuizResponse[]): PreferenceVector {
  const vector: PreferenceVector = {
    offensive: 0,
    defensive: 0,
    fastPaced: 0,
    strategic: 0,
    dominant: 0,
    underdog: 0,
    sportWeights: {},
    regionWeights: {},
    speed: 0,
    teamwork: 0,
    individual: 0,
    strategy: 0
  };

  for (const response of responses) {
    switch (response.questionId) {
      case 'sports_interest':
        // Multi-select: each sport gets equal weight
        const sports = response.answers as string[];
        const weight = 1.0 / sports.length;
        sports.forEach(sport => {
          vector.sportWeights[sport] = weight;
        });
        break;

      case 'excitement_factors':
        // Map factors to attributes
        const factors = response.answers as string[];
        if (factors.includes('speed')) {
          vector.fastPaced += 0.3;
          vector.speed += 0.5;
        }
        if (factors.includes('strategy')) {
          vector.strategic += 0.3;
          vector.strategy += 0.5;
        }
        if (factors.includes('team_chemistry')) {
          vector.teamwork += 0.5;
        }
        if (factors.includes('individual_brilliance')) {
          vector.individual += 0.5;
        }
        break;

      case 'preferred_pace':
        const pace = response.answers as string;
        if (pace === 'fast') {
          vector.fastPaced = 0.9;
        } else if (pace === 'methodical') {
          vector.strategic = 0.9;
        }
        break;

      case 'team_personality':
        const personality = response.answers as string;
        if (personality === 'dominant') {
          vector.dominant = 0.8;
        } else if (personality === 'underdog') {
          vector.underdog = 0.8;
        }
        break;

      case 'region_timezone':
        const region = response.answers as string;
        vector.regionWeights[region] = 1.0;
        break;
    }
  }

  // Normalize values to [0, 1]
  const keys = ['offensive', 'defensive', 'fastPaced', 'strategic', 'speed', 'teamwork', 'individual', 'strategy'];
  keys.forEach(key => {
    vector[key] = Math.min(vector[key], 1.0);
  });

  return vector;
}
```

---

## 8. Cold Start Problem

### New Users (No Interactions)

- Rely heavily on quiz responses (content-based)
- Use popularity as tiebreaker
- Provide diverse recommendations across sports

### New Teams/Players (No Interactions)

- Use content attributes only
- Match to users based on attribute similarity
- Leverage existing league/sport popularity

### Strategy:

```typescript
function getRecommendations(user: User): Recommendation[] {
  const interactionCount = user.interactions?.length || 0;

  if (interactionCount === 0) {
    // Cold start: Use quiz + popularity
    return getContentBasedRecommendations(user, {
      contentWeight: 0.7,
      popularityWeight: 0.3,
      collaborativeWeight: 0
    });
  } else if (interactionCount < 10) {
    // Warming up: Blend content + emerging collaborative signal
    return getHybridRecommendations(user, {
      contentWeight: 0.6,
      collaborativeWeight: 0.2,
      popularityWeight: 0.2
    });
  } else {
    // Established user: Full hybrid
    return getHybridRecommendations(user, {
      contentWeight: 0.5,
      collaborativeWeight: 0.25,
      contextualWeight: 0.15,
      popularityWeight: 0.1
    });
  }
}
```

---

## 9. Performance Optimization

### Pre-computation

1. **Team Similarity Matrix**: Compute pairwise cosine similarities offline
   - Run nightly batch job
   - Store in `TeamSimilarity` table
   - Query: O(1) lookup instead of O(n) computation

2. **User Preference Vectors**: Update on quiz submission and every N interactions
   - Cached in `UserPreference` table
   - Avoid recalculating on every request

3. **Popular Teams Cache**: Top 20 teams per sport cached in Redis

### Query Optimization

```typescript
// Bad: Fetch all teams and score in-memory
const allTeams = await prisma.team.findMany({ include: { league: true } });
const scored = allTeams.map(team => ({ team, score: computeScore(user, team) }));

// Good: Filter candidates first, then score
const candidateTeams = await prisma.team.findMany({
  where: {
    league: {
      sportId: { in: user.preferences.preferredSports }
    },
    popularityScore: { gte: 30 } // Pre-filter low-quality candidates
  },
  include: { league: true },
  take: 50 // Limit candidates
});
const scored = candidateTeams.map(team => ({ team, score: computeScore(user, team) }));
```

---

## 10. Testing & Validation

### Unit Tests

1. **Cosine Similarity**: Verify with known vectors
2. **Quiz Scoring**: Ensure correct mapping
3. **Explanation Generation**: Check all reason types

### Integration Tests

1. **Cold Start**: New user gets diverse recommendations
2. **Preference Evolution**: User interactions update recommendations
3. **Diversification**: Top 5 includes multiple sports

### Metrics

- **Precision@5**: % of top 5 recommendations that user follows
- **Diversity**: Number of unique sports/leagues in top 10
- **Explanation Quality**: Manual review of reason messages

---

## 11. Future Enhancements

1. **Deep Learning**: Replace cosine similarity with neural collaborative filtering
2. **Real-time Updates**: Stream processing for immediate recommendation updates
3. **Multi-armed Bandits**: Exploration vs exploitation for new teams
4. **Graph Neural Networks**: Model user-team-player-sport graph
5. **A/B Testing Framework**: Experiment with different weight combinations
6. **Seasonality**: Adjust for playoff seasons, transfer windows
7. **Negative Signals**: Track dislikes, skips, unfollows

---

## Summary

The SportOnboard recommender is a **practical hybrid system** balancing:
- **Accuracy**: Content-based ensures relevance to stated preferences
- **Discovery**: Collaborative filtering surfaces unexpected matches
- **Explainability**: Every recommendation comes with clear reasons
- **Performance**: Pre-computation and caching enable real-time responses
- **Adaptability**: Weights adjust based on user maturity (cold start → warm → established)

This design prioritizes **MVP simplicity** while providing a **clear path to ML sophistication** in future iterations.
