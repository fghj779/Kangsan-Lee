# SportOnboard - Sports Team Onboarding Platform

![SportOnboard](https://via.placeholder.com/1200x400?text=SportOnboard+-+Find+Your+Perfect+Sports+Team)

## 🎯 Overview

**SportOnboard** is an intelligent onboarding platform that helps users discover and fall in love with sports teams across 8 major sports. Through personalized recommendations, interactive rule visualizations, and engaging player narratives, SportOnboard transforms sports newcomers into passionate fans.

### Key Features

- 🎨 **Personalized Team Recommendations**: Hybrid recommender system (content-based + collaborative filtering)
- 📊 **Interactive Rule Visualizations**: Learn offside, strike zones, and shot clocks through hands-on simulations
- ⭐ **Star Player Stories**: Discover athletes through narrative-driven profiles
- 🏆 **8 Sports Covered**: NBA, Soccer, MLB, F1, NFL, Cricket, Tennis, NHL
- 📱 **Responsive Design**: Beautiful UI built with Next.js 14 and Tailwind CSS
- 🧪 **Full-Stack TypeScript**: Type-safe from database to UI

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** (or **pnpm**, **yarn**)
- **PostgreSQL** 14+ (local or hosted)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd sportonboard
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sportonboard?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Push schema to database
npm run db:push

# Seed with sample data (sports, teams, players, rules)
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000) to see the app!

---

## 📁 Project Structure

```
sportonboard/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── sports/               # Sports endpoints
│   │   ├── teams/                # Teams endpoints
│   │   ├── players/              # Players endpoints
│   │   ├── quiz/                 # Quiz endpoints
│   │   ├── recommendations/      # Recommendation engine
│   │   ├── interactions/         # User interaction tracking
│   │   └── users/                # User session management
│   ├── onboarding/               # Quiz flow
│   ├── recommendations/          # Team recommendations page
│   ├── teams/[teamId]/           # Team detail pages
│   ├── players/[playerId]/       # Player detail pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── layout/                   # Header, Footer
│   ├── rules/                    # Interactive rule visualizations
│   │   ├── SoccerOffsideViz.tsx
│   │   ├── BaseballStrikeZoneViz.tsx
│   │   └── BasketballShotClockViz.tsx
│   └── (other UI components)
├── lib/
│   ├── prisma.ts                 # Prisma client instance
│   ├── recommender.ts            # Recommendation engine logic
│   └── quiz.ts                   # Quiz scoring logic
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script with sample data
├── __tests__/
│   └── recommender.test.ts       # Unit tests
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🗄️ Database Schema

### Core Entities

- **Sport**: NBA, Soccer, MLB, F1, NFL, Cricket, Tennis, NHL
- **League**: Premier League, La Liga, NBA, etc.
- **Team**: Teams with playstyle attributes, success levels, fan culture
- **Player**: Players with narratives, playstyle tags, achievements
- **Rule**: Interactive rules with visualization configs

### User & Recommendations

- **User**: Session-based users (anonymous by default)
- **UserPreference**: Preference vectors from quiz responses
- **QuizResponse**: Stored quiz answers
- **Interaction**: Tracks views, likes, follows, shares
- **TeamSimilarity**: Precomputed team similarities (future)

---

## 🧠 Recommender System

SportOnboard uses a **hybrid recommender** combining:

1. **Content-Based Filtering**
   - Computes cosine similarity between user preference vectors and team attribute vectors
   - Factors: playstyle (offensive/defensive), pace, team personality (dominant/underdog)

2. **Collaborative Filtering (Implicit)**
   - "Users who liked X also liked Y"
   - Weighted by interaction type (view=1, like=2, follow=3, share=2.5)

3. **Contextual Signals**
   - Timezone compatibility for match times
   - Regional affinity
   - Sport preferences

4. **Explainability**
   - Every recommendation includes reasons: "Because you love fast-paced teams"

### Formula

```
finalScore = (contentScore × 0.5) + (collaborativeScore × 0.25) +
             (contextualScore × 0.15) + (popularityScore × 0.1)
```

Weights adjust based on user maturity (cold start → established).

See `RECOMMENDER_SYSTEM.md` for detailed formulas.

---

## 🎮 Interactive Rule Visualizations

### 1. Soccer Offside Rule (SVG)
- Drag players and ball to see when offside occurs
- Real-time feedback with visual indicators
- **File**: `components/rules/SoccerOffsideViz.tsx`

### 2. Baseball Strike Zone (Canvas)
- Click to throw pitches
- Strike/ball counter with visual strike zone
- **File**: `components/rules/BaseballStrikeZoneViz.tsx`

### 3. Basketball Shot Clock & 3-Point Line (SVG)
- 24-second shot clock simulation
- Click inside/outside 3-point line to shoot
- **File**: `components/rules/BasketballShotClockViz.tsx`

---

## 🛠️ Development Commands

```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)

# Database
npm run db:push              # Push Prisma schema to database
npm run db:migrate           # Create migration files
npm run db:seed              # Seed database with sample data
npm run db:studio            # Open Prisma Studio (DB GUI)

# Building
npm run build                # Build for production
npm run start                # Start production server

# Testing
npm run test                 # Run Jest tests
npm run test:watch           # Run tests in watch mode

# Code Quality
npm run lint                 # Run ESLint
npm run type-check           # TypeScript type checking
```

---

## 🧪 Testing

Run unit tests for recommender and quiz logic:

```bash
npm run test
```

Tests cover:
- Cosine similarity computation
- Team-to-vector conversion
- Quiz response to preference vector mapping
- Edge cases (zero vectors, normalization)

---

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/sportonboard` |
| `NEXT_PUBLIC_APP_URL` | App base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment (development/production) | `development` |

---

## 📊 API Endpoints

### Sports
- `GET /api/sports` - List all sports
- `GET /api/sports/:sportId` - Get sport details with top teams/players

### Teams
- `GET /api/teams` - List teams (with filters)
- `GET /api/teams/:teamId` - Get team details

### Players
- `GET /api/players/:playerId` - Get player details

### Quiz
- `GET /api/quiz/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz responses

### Recommendations
- `GET /api/recommendations/teams` - Get personalized team recommendations
  - Header: `X-Session-ID: <sessionId>`

### Interactions
- `POST /api/interactions` - Track user interaction (view, like, follow, share)

### Users
- `POST /api/users/session` - Create or retrieve user session

See `API_CONTRACT.md` for full API documentation.

---

## 🎨 Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **SVG & Canvas** - Interactive visualizations

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database

### Testing
- **Jest** - Unit testing framework

---

## 📈 Seed Data Summary

The seed script (`npm run db:seed`) populates:

- **8 Sports**: NBA, Soccer, MLB, F1, NFL, Cricket, Tennis, NHL
- **6+ Leagues**: NBA, Premier League, La Liga, MLB, Formula 1, NFL
- **10+ Teams**: Lakers, Warriors, Mavericks, Real Madrid, Liverpool, Yankees, Red Bull, Ferrari, etc.
- **6+ Players**: LeBron James, Stephen Curry, Luka Dončić, Messi, Salah, Verstappen
- **5+ Rules**: Offside, Strike Zone, Shot Clock, F1 Flags, LBW

All data includes rich narratives, playstyle tags, and achievements.

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect GitHub repo** to Vercel
2. **Add environment variables**:
   - `DATABASE_URL`: Hosted PostgreSQL (e.g., Neon, Supabase, Railway)
3. **Deploy**: Vercel automatically builds and deploys

### Docker (Alternative)

```dockerfile
# Dockerfile (example)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t sportonboard .
docker run -p 3000:3000 --env-file .env sportonboard
```

---

## 📝 User Flow

### 1. Landing Page
- Hero section with CTA: "Start Your Journey"
- Featured sports grid
- Features overview

### 2. Onboarding Quiz
- 6 questions covering:
  - Sports interests
  - Excitement factors (speed, strategy, etc.)
  - Pace preference (fast/methodical)
  - Team personality (dominant/underdog)
  - Region/timezone
  - Playstyle preference
- Progress bar and step-by-step navigation

### 3. Recommendations
- Top 5 teams with match scores
- Reasons for each recommendation
- "Explore All Teams" CTA

### 4. Team/Player Exploration
- Detailed team pages with story, playstyle, roster
- Player pages with narratives, achievements, stats

### 5. Interactive Learning
- Rule visualization pages
- Mini-quizzes to test understanding

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📚 Documentation

- **PRD**: `PRODUCT_REQUIREMENTS.md` - Product requirements and user stories
- **Data Model**: `DATA_MODEL.md` - Prisma schema design
- **API Contract**: `API_CONTRACT.md` - Complete API reference
- **Recommender**: `RECOMMENDER_SYSTEM.md` - Algorithm details and formulas
- **UI Architecture**: `UI_ARCHITECTURE.md` - Component structure and routes

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres

# Reset database
npm run db:push
npm run db:seed
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate
```

---

## 📸 Screenshots

> **Note**: Add screenshots of key pages:
> - Landing page hero
> - Quiz flow
> - Recommendation page
> - Team detail page
> - Interactive rule visualization

---

## 🎓 Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with **Next.js**, **Prisma**, and **Tailwind CSS**
- Sports data is for demonstration purposes
- Interactive visualizations inspired by educational sports platforms

---

## 📧 Contact

For questions or feedback:
- **Issues**: Open a GitHub issue
- **Email**: your-email@example.com

---

**Happy Onboarding! 🏀⚽⚾🏎️**
