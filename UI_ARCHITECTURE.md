# SportOnboard - UI Architecture

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: CSS transitions (optional: Framer Motion)
- **Charts/Viz**: Custom SVG + Canvas (no heavy libraries)
- **State Management**: React Context + Server Components
- **Forms**: React Hook Form (optional)

---

## Route Structure (App Router)

```
app/
├── page.tsx                          # Landing page (/)
├── layout.tsx                        # Root layout with navigation
├── globals.css                       # Global Tailwind styles
│
├── onboarding/
│   ├── page.tsx                      # Quiz start (/onboarding)
│   └── quiz/
│       └── page.tsx                  # Quiz flow (/onboarding/quiz)
│
├── recommendations/
│   └── page.tsx                      # Team recommendations (/recommendations)
│
├── sports/
│   ├── page.tsx                      # All sports (/sports)
│   └── [sportId]/
│       ├── page.tsx                  # Sport detail (/sports/nba)
│       └── rules/
│           └── [ruleSlug]/
│               └── page.tsx          # Rule visualization (/sports/soccer/rules/offside)
│
├── teams/
│   ├── page.tsx                      # All teams (/teams)
│   └── [teamId]/
│       └── page.tsx                  # Team detail (/teams/lakers)
│
├── players/
│   ├── page.tsx                      # All players (/players)
│   └── [playerId]/
│       └── page.tsx                  # Player detail (/players/lebron-james)
│
├── dashboard/
│   └── page.tsx                      # User dashboard (/dashboard)
│
├── api/                              # API routes (Next.js API)
│   ├── sports/
│   │   ├── route.ts                  # GET /api/sports
│   │   └── [sportId]/
│   │       └── route.ts              # GET /api/sports/:id
│   ├── teams/
│   │   ├── route.ts                  # GET /api/teams
│   │   └── [teamId]/
│   │       └── route.ts              # GET /api/teams/:id
│   ├── players/
│   │   ├── route.ts
│   │   └── [playerId]/
│   │       └── route.ts
│   ├── rules/
│   │   ├── route.ts
│   │   └── [ruleId]/
│   │       └── route.ts
│   ├── quiz/
│   │   ├── questions/
│   │   │   └── route.ts              # GET /api/quiz/questions
│   │   └── submit/
│   │       └── route.ts              # POST /api/quiz/submit
│   ├── recommendations/
│   │   ├── teams/
│   │   │   └── route.ts              # GET /api/recommendations/teams
│   │   └── players/
│   │       └── route.ts
│   ├── interactions/
│   │   ├── route.ts                  # POST /api/interactions
│   │   ├── follow/
│   │   │   └── route.ts              # POST /api/interactions/follow
│   │   └── stats/
│   │       └── route.ts              # GET /api/interactions/stats
│   └── users/
│       ├── session/
│       │   └── route.ts              # POST /api/users/session
│       └── me/
│           └── route.ts              # GET /api/users/me
│
└── not-found.tsx                     # 404 page
```

---

## Component Architecture

### Component Organization

```
components/
├── layout/
│   ├── Header.tsx                    # Main navigation bar
│   ├── Footer.tsx                    # Footer with links
│   └── Sidebar.tsx                   # Optional sidebar (mobile menu)
│
├── landing/
│   ├── Hero.tsx                      # Landing hero section
│   ├── SportsGrid.tsx                # Featured sports grid
│   ├── FeatureShowcase.tsx           # Key features (rules, stars, teams)
│   └── CTASection.tsx                # Call-to-action to start quiz
│
├── onboarding/
│   ├── QuizProgress.tsx              # Progress indicator (1/6, 2/6...)
│   ├── QuestionCard.tsx              # Generic question wrapper
│   ├── MultiSelectQuestion.tsx       # Multi-select with cards
│   ├── SingleChoiceQuestion.tsx      # Radio buttons
│   ├── ScaleQuestion.tsx             # Slider or rating scale
│   ├── MediaChoiceQuestion.tsx       # Video/image selection grid
│   └── QuizSummary.tsx               # Review before submit
│
├── recommendations/
│   ├── RecommendationCard.tsx        # Team recommendation with reasons
│   ├── ReasonBadge.tsx               # Individual reason tag
│   ├── RecommendationList.tsx        # List of top 5 teams
│   └── FollowButton.tsx              # Follow/unfollow team action
│
├── sports/
│   ├── SportCard.tsx                 # Sport overview card
│   ├── SportGrid.tsx                 # Grid of sports
│   ├── SportHeader.tsx               # Sport detail page header
│   ├── LeagueList.tsx                # Leagues within a sport
│   └── RuleCard.tsx                  # Rule preview card
│
├── teams/
│   ├── TeamCard.tsx                  # Team card (logo, name, tags)
│   ├── TeamGrid.tsx                  # Grid of teams
│   ├── TeamHeader.tsx                # Team detail hero (logo, colors, story)
│   ├── TeamRoster.tsx                # Player list
│   ├── TeamStats.tsx                 # Win rate, popularity charts
│   ├── SimilarTeams.tsx              # "Teams like this" section
│   └── TeamFilters.tsx               # Filter by league, style, etc.
│
├── players/
│   ├── PlayerCard.tsx                # Player card (photo, name, position)
│   ├── PlayerGrid.tsx                # Grid of players
│   ├── PlayerHeader.tsx              # Player detail hero
│   ├── PlayerNarrative.tsx           # "Why fans love them" story
│   ├── PlaystyleTags.tsx             # Visual tags (Sniper, Clutch, etc.)
│   ├── CareerTimeline.tsx            # Achievements timeline
│   ├── PlayerStats.tsx               # Stats dashboard
│   └── SimilarPlayers.tsx            # "Players like this"
│
├── rules/
│   ├── RuleExplanation.tsx           # Text explanation section
│   ├── SoccerOffsideViz.tsx          # Interactive SVG for offside
│   ├── BaseballStrikeZoneViz.tsx     # Canvas for strike zone
│   ├── BasketballShotClockViz.tsx    # Interactive court + shot clock
│   ├── RuleQuiz.tsx                  # Mini-quiz for rule understanding
│   └── RuleNavigation.tsx            # Navigate between rules
│
├── dashboard/
│   ├── DashboardHeader.tsx           # Welcome + stats summary
│   ├── FollowedTeamsSection.tsx      # Teams user follows
│   ├── FollowedPlayersSection.tsx    # Players user follows
│   ├── RecommendedContent.tsx        # Personalized suggestions
│   └── InteractionHistory.tsx        # Recent activity
│
├── ui/                               # Reusable UI primitives
│   ├── Button.tsx                    # Primary button component
│   ├── Card.tsx                      # Card container
│   ├── Badge.tsx                     # Tag/badge component
│   ├── Input.tsx                     # Form input
│   ├── Select.tsx                    # Dropdown select
│   ├── Slider.tsx                    # Range slider
│   ├── Spinner.tsx                   # Loading spinner
│   ├── Modal.tsx                     # Modal dialog
│   ├── Tabs.tsx                      # Tab navigation
│   └── Avatar.tsx                    # User/player avatar
│
└── shared/
    ├── SearchBar.tsx                 # Global search
    ├── InteractionTracker.tsx        # Track dwell time, clicks
    ├── LikeButton.tsx                # Like action
    ├── ShareButton.tsx               # Share action
    └── ErrorBoundary.tsx             # Error handling wrapper
```

---

## Page Layouts

### 1. Landing Page (`/`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│                                      │
│            Hero Section              │
│   "Discover Your Next Sports Team"  │
│         [Start Your Journey]         │
│                                      │
├──────────────────────────────────────┤
│          Featured Sports             │
│   [NBA] [Soccer] [F1] [NFL] ...      │
├──────────────────────────────────────┤
│         Feature Showcase             │
│  - Interactive Rules                 │
│  - Star Player Stories               │
│  - Personalized Recommendations      │
├──────────────────────────────────────┤
│           CTA Section                │
│    "Ready to find your team?"        │
│         [Take the Quiz]              │
├──────────────────────────────────────┤
│              Footer                  │
└──────────────────────────────────────┘
```

**Components:**
- `<Hero />`
- `<SportsGrid />`
- `<FeatureShowcase />`
- `<CTASection />`

---

### 2. Onboarding Quiz (`/onboarding/quiz`)

**Layout:**
```
┌──────────────────────────────────────┐
│         Quiz Progress (3/6)          │
│  ▓▓▓▓▓▓▓▓░░░░░░                      │
├──────────────────────────────────────┤
│                                      │
│         Question Title               │
│     "What excites you about          │
│          sports?"                    │
│                                      │
│  [ ] Speed & athleticism             │
│  [x] Strategy & tactics              │
│  [x] Team chemistry                  │
│  [ ] Individual brilliance           │
│                                      │
│               [Next]                 │
│                                      │
└──────────────────────────────────────┘
```

**Components:**
- `<QuizProgress />`
- `<QuestionCard />`
- `<MultiSelectQuestion />` or other question types
- Navigation buttons

---

### 3. Recommendations Page (`/recommendations`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│                                      │
│   "Your Perfect Teams Await!"        │
│   Based on your preferences...       │
│                                      │
├──────────────────────────────────────┤
│  1. [Logo] Dallas Mavericks          │
│     NBA • Fast-paced offense         │
│     ✓ Love fast-paced teams          │
│     ✓ Offensive powerhouse           │
│     [Follow Team]                    │
├──────────────────────────────────────┤
│  2. [Logo] Real Madrid               │
│     La Liga • Dominant force         │
│     ✓ Historic success               │
│     ✓ Global fanbase                 │
│     [Follow Team]                    │
├──────────────────────────────────────┤
│  ... (3 more teams)                  │
│                                      │
│     [Explore More Teams]             │
│                                      │
└──────────────────────────────────────┘
```

**Components:**
- `<RecommendationList />`
- `<RecommendationCard />` (×5)
- `<ReasonBadge />`
- `<FollowButton />`

---

### 4. Team Detail Page (`/teams/:teamId`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│  [Logo]  Los Angeles Lakers          │
│          NBA • Western Conf          │
│  [Primary Color Background]          │
│  [Follow] [Like] [Share]             │
├──────────────────────────────────────┤
│  The Story                           │
│  One of the most storied franchises  │
│  in NBA history, the Lakers have...  │
├──────────────────────────────────────┤
│  Playstyle: [Offensive] [Star Power] │
│  Win Rate: 65% | Popularity: 95/100  │
├──────────────────────────────────────┤
│  Key Players                         │
│  [LeBron James] [Anthony Davis] ...  │
├──────────────────────────────────────┤
│  Similar Teams                       │
│  [Boston Celtics] [Golden State]     │
├──────────────────────────────────────┤
│  Fan Culture                         │
│  "Lakers Nation is known for..."     │
└──────────────────────────────────────┘
```

**Components:**
- `<TeamHeader />`
- `<TeamStats />`
- `<TeamRoster />`
- `<SimilarTeams />`
- `<InteractionTracker />` (track dwell time)

---

### 5. Player Detail Page (`/players/:playerId`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│  [Photo]   LeBron James              │
│            Forward • #23             │
│            LA Lakers                 │
│  [Follow] [Like] [Share]             │
├──────────────────────────────────────┤
│  Playstyle: [Clutch] [Playmaker]     │
│             [Leader]                 │
├──────────────────────────────────────┤
│  Why Fans Love Him                   │
│  LeBron James isn't just a player... │
│  (narrative text)                    │
├──────────────────────────────────────┤
│  Career Highlights                   │
│  ━━●━━━━━━━━━━━━━━━━━━              │
│  2003: NBA Draft #1 Pick             │
│  2012: First Championship            │
│  2020: Lakers Championship           │
├──────────────────────────────────────┤
│  Stats                               │
│  PPG: 27.5 | APG: 8.2 | RPG: 7.8     │
│  [Bar charts]                        │
├──────────────────────────────────────┤
│  Similar Players                     │
│  [Kevin Durant] [Giannis] ...        │
└──────────────────────────────────────┘
```

**Components:**
- `<PlayerHeader />`
- `<PlaystyleTags />`
- `<PlayerNarrative />`
- `<CareerTimeline />`
- `<PlayerStats />`
- `<SimilarPlayers />`

---

### 6. Rule Visualization Page (`/sports/soccer/rules/offside`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│  Soccer > Rules > Offside            │
│                                      │
│  Understanding the Offside Rule      │
│  Difficulty: ●●●○○ (3/5)             │
├──────────────────────────────────────┤
│  What is Offside?                    │
│  A player is in an offside position  │
│  if they are closer to the opponent's│
│  goal line than both the ball and... │
├──────────────────────────────────────┤
│  ┌────────────────────────────┐      │
│  │  [Interactive SVG Field]   │      │
│  │                            │      │
│  │  ⚽ Ball                    │      │
│  │  👤 Attacker (draggable)   │      │
│  │  🛡️ Defenders (draggable)  │      │
│  │                            │      │
│  │  Status: OFFSIDE ❌        │      │
│  └────────────────────────────┘      │
│  Try moving the players to see       │
│  when offside occurs!                │
├──────────────────────────────────────┤
│  Test Your Understanding             │
│  [Mini Quiz - 3 questions]           │
└──────────────────────────────────────┘
```

**Components:**
- `<RuleExplanation />`
- `<SoccerOffsideViz />` (SVG interactive)
- `<RuleQuiz />`
- `<RuleNavigation />` (prev/next rules)

---

### 7. Dashboard (`/dashboard`)

**Layout:**
```
┌──────────────────────────────────────┐
│           Header (Nav)               │
├──────────────────────────────────────┤
│  Welcome back!                       │
│  You're following 3 teams, 5 players │
├──────────────────────────────────────┤
│  Your Teams                          │
│  [Lakers] [Real Madrid] [Mercedes]   │
├──────────────────────────────────────┤
│  Your Players                        │
│  [LeBron] [Messi] [Hamilton] ...     │
├──────────────────────────────────────┤
│  Recommended For You                 │
│  Based on your recent activity...    │
│  [New team cards]                    │
├──────────────────────────────────────┤
│  Recent Activity                     │
│  You liked "Understanding F1 Flags"  │
│  You followed Golden State Warriors  │
└──────────────────────────────────────┘
```

**Components:**
- `<DashboardHeader />`
- `<FollowedTeamsSection />`
- `<FollowedPlayersSection />`
- `<RecommendedContent />`
- `<InteractionHistory />`

---

## Component Details

### Core Interactive Components

#### 1. **SoccerOffsideViz**

**Technology:** SVG with draggable elements

**Features:**
- Soccer field background (SVG)
- Draggable ball, attacker, defenders
- Real-time offside calculation
- Visual feedback (red/green zones)
- Explanation text updates dynamically

**Props:**
```typescript
type SoccerOffsideVizProps = {
  onComplete?: () => void;
  showHints?: boolean;
}
```

---

#### 2. **BaseballStrikeZoneViz**

**Technology:** HTML5 Canvas

**Features:**
- Strike zone rectangle
- Pitch input (click to place ball)
- Strike/ball counter
- Pitch history visualization
- "At Bat" simulation

**Props:**
```typescript
type BaseballStrikeZoneVizProps = {
  onComplete?: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

---

#### 3. **BasketballShotClockViz**

**Technology:** SVG + Canvas hybrid

**Features:**
- Half-court diagram
- Shot clock countdown (24s)
- Clickable court positions (3pt vs 2pt)
- Score tracker
- Pressure scenarios (tie game, down by 1, etc.)

**Props:**
```typescript
type BasketballShotClockVizProps = {
  scenario?: 'regular' | 'pressure';
  onComplete?: () => void;
}
```

---

#### 4. **InteractionTracker**

**Technology:** React Hook + IntersectionObserver

**Features:**
- Track page view duration
- Auto-send interaction on unmount (>5s)
- Visibility detection (pause when tab inactive)

**Usage:**
```tsx
<InteractionTracker
  entityType="team"
  entityId={teamId}
  interactionType="view"
>
  <TeamDetailContent />
</InteractionTracker>
```

---

## State Management

### User Session Context

```typescript
// contexts/UserSessionContext.tsx

type UserSession = {
  userId: string | null;
  sessionId: string;
  isAnonymous: boolean;
  hasCompletedQuiz: boolean;
  preferences: UserPreference | null;
};

type UserSessionContextType = {
  session: UserSession | null;
  loading: boolean;
  updateSession: (data: Partial<UserSession>) => void;
  followTeam: (teamId: string) => Promise<void>;
  unfollowTeam: (teamId: string) => Promise<void>;
  trackInteraction: (params: InteractionParams) => Promise<void>;
};

export function UserSessionProvider({ children }) {
  // Implementation
}

export function useUserSession() {
  return useContext(UserSessionContext);
}
```

### Quiz State (Local)

```typescript
// Use React useState for quiz flow
const [currentStep, setCurrentStep] = useState(0);
const [responses, setResponses] = useState<QuizResponse[]>([]);
```

---

## Styling Approach

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',   // Blue
        secondary: '#10b981', // Green
        accent: '#f59e0b',    // Amber
        danger: '#ef4444',    // Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Design Tokens

- **Spacing**: Use Tailwind's default scale (4px base)
- **Border Radius**: `rounded-lg` (8px) for cards, `rounded-full` for badges
- **Shadows**: `shadow-md` for cards, `shadow-lg` for modals
- **Typography**: `font-display` for headings, `font-sans` for body

---

## Responsive Breakpoints

- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns for grids)
- **Desktop**: > 1024px (3-4 columns for grids)

**Example:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {teams.map(team => <TeamCard key={team.id} team={team} />)}
</div>
```

---

## Accessibility

- **Semantic HTML**: Use `<nav>`, `<main>`, `<article>`, `<section>`
- **ARIA Labels**: All interactive elements have `aria-label`
- **Keyboard Navigation**: Tab order, focus states
- **Color Contrast**: WCAG AA compliance (4.5:1 for text)
- **Alt Text**: All images have descriptive alt attributes

---

## Performance Optimizations

### Code Splitting

- **Route-based**: Automatic with Next.js App Router
- **Component-level**: Lazy load visualizations

```tsx
const SoccerOffsideViz = dynamic(() => import('@/components/rules/SoccerOffsideViz'), {
  loading: () => <Spinner />,
  ssr: false
});
```

### Image Optimization

- Use Next.js `<Image>` component
- Lazy load images below fold
- Serve WebP format with fallbacks

### Data Fetching

- **Server Components**: Fetch data at build/request time
- **Client Components**: Use SWR or React Query for caching
- **Prefetching**: Prefetch team/player data on hover

---

## Error Handling

### Error Boundary

```tsx
// components/shared/ErrorBoundary.tsx
export function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error) => console.error(error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### Loading States

- **Skeleton screens** for lists/grids
- **Spinners** for async actions (follow, submit)
- **Optimistic updates** for interactions

---

## Summary

The SportOnboard UI is designed for:
- **Clarity**: Simple, scannable layouts
- **Interactivity**: Engaging rule visualizations
- **Personalization**: Context-aware recommendations
- **Performance**: Fast page loads, smooth animations
- **Accessibility**: Usable by everyone

All components are **modular** and **reusable**, enabling rapid iteration and easy testing.
