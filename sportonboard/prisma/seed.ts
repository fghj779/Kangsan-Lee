import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.interaction.deleteMany();
  await prisma.quizResponse.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.playerSimilarity.deleteMany();
  await prisma.teamSimilarity.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.league.deleteMany();
  await prisma.sport.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create Sports
  const basketball = await prisma.sport.create({
    data: {
      name: 'NBA',
      displayName: 'Basketball',
      category: 'team_sport',
      complexityLevel: 5,
      description: 'Fast-paced team sport with high-flying dunks and three-point shooting',
      imageUrl: 'https://via.placeholder.com/400x200?text=NBA',
      popularity: 95,
    },
  });

  const soccer = await prisma.sport.create({
    data: {
      name: 'Soccer',
      displayName: 'Football (Soccer)',
      category: 'team_sport',
      complexityLevel: 6,
      description: 'The beautiful game, played and loved worldwide',
      imageUrl: 'https://via.placeholder.com/400x200?text=Soccer',
      popularity: 100,
    },
  });

  const baseball = await prisma.sport.create({
    data: {
      name: 'MLB',
      displayName: 'Baseball',
      category: 'team_sport',
      complexityLevel: 7,
      description: 'America\'s pastime with strategic depth and historic rivalries',
      imageUrl: 'https://via.placeholder.com/400x200?text=Baseball',
      popularity: 75,
    },
  });

  const f1 = await prisma.sport.create({
    data: {
      name: 'F1',
      displayName: 'Formula 1',
      category: 'racing',
      complexityLevel: 8,
      description: 'High-speed racing with cutting-edge technology',
      imageUrl: 'https://via.placeholder.com/400x200?text=F1',
      popularity: 85,
    },
  });

  const nfl = await prisma.sport.create({
    data: {
      name: 'NFL',
      displayName: 'American Football',
      category: 'team_sport',
      complexityLevel: 8,
      description: 'Strategic battles with explosive plays',
      imageUrl: 'https://via.placeholder.com/400x200?text=NFL',
      popularity: 90,
    },
  });

  const cricket = await prisma.sport.create({
    data: {
      name: 'Cricket',
      displayName: 'Cricket',
      category: 'team_sport',
      complexityLevel: 9,
      description: 'Gentleman\'s game with tactical complexity',
      imageUrl: 'https://via.placeholder.com/400x200?text=Cricket',
      popularity: 80,
    },
  });

  const tennis = await prisma.sport.create({
    data: {
      name: 'Tennis',
      displayName: 'Tennis',
      category: 'individual_sport',
      complexityLevel: 6,
      description: 'Individual battles of skill and endurance',
      imageUrl: 'https://via.placeholder.com/400x200?text=Tennis',
      popularity: 70,
    },
  });

  const nhl = await prisma.sport.create({
    data: {
      name: 'NHL',
      displayName: 'Hockey',
      category: 'team_sport',
      complexityLevel: 7,
      description: 'Fast-paced action on ice',
      imageUrl: 'https://via.placeholder.com/400x200?text=NHL',
      popularity: 65,
    },
  });

  console.log('✅ Created 8 sports');

  // Create Leagues
  const nbaLeague = await prisma.league.create({
    data: {
      sportId: basketball.id,
      name: 'NBA',
      region: 'North America',
      tier: 1,
      season: '2024-25',
      description: 'National Basketball Association',
    },
  });

  const premierLeague = await prisma.league.create({
    data: {
      sportId: soccer.id,
      name: 'Premier League',
      region: 'Europe',
      tier: 1,
      season: '2024-25',
      description: 'English Premier League',
    },
  });

  const laLiga = await prisma.league.create({
    data: {
      sportId: soccer.id,
      name: 'La Liga',
      region: 'Europe',
      tier: 1,
      season: '2024-25',
      description: 'Spanish La Liga',
    },
  });

  const mlbLeague = await prisma.league.create({
    data: {
      sportId: baseball.id,
      name: 'MLB',
      region: 'North America',
      tier: 1,
      season: '2024',
      description: 'Major League Baseball',
    },
  });

  const f1League = await prisma.league.create({
    data: {
      sportId: f1.id,
      name: 'Formula 1',
      region: 'Global',
      tier: 1,
      season: '2024',
      description: 'FIA Formula One World Championship',
    },
  });

  const nflLeague = await prisma.league.create({
    data: {
      sportId: nfl.id,
      name: 'NFL',
      region: 'North America',
      tier: 1,
      season: '2024',
      description: 'National Football League',
    },
  });

  console.log('✅ Created leagues');

  // Create NBA Teams
  const lakers = await prisma.team.create({
    data: {
      leagueId: nbaLeague.id,
      name: 'Los Angeles Lakers',
      shortName: 'Lakers',
      city: 'Los Angeles',
      country: 'USA',
      foundedYear: 1947,
      logoUrl: 'https://via.placeholder.com/100?text=LAL',
      primaryColor: '#552583',
      secondaryColor: '#FDB927',
      stadiumName: 'Crypto.com Arena',
      playstyle: ['offensive', 'fast_paced', 'star_driven'],
      fanbaseRegions: ['North America', 'Asia'],
      successLevel: 'dominant',
      fanbaseSize: 'massive',
      story: 'The Lakers are one of the most storied franchises in NBA history with 17 championships. From Magic and Kareem to Kobe and Shaq, to LeBron and AD, they\'ve always been home to basketball royalty.',
      culture: 'Showtime basketball, celebrity fans courtside, and a championship-or-bust mentality.',
      winRate: 0.62,
      popularityScore: 98,
    },
  });

  const warriors = await prisma.team.create({
    data: {
      leagueId: nbaLeague.id,
      name: 'Golden State Warriors',
      shortName: 'Warriors',
      city: 'San Francisco',
      country: 'USA',
      foundedYear: 1946,
      logoUrl: 'https://via.placeholder.com/100?text=GSW',
      primaryColor: '#1D428A',
      secondaryColor: '#FFC72C',
      stadiumName: 'Chase Center',
      playstyle: ['offensive', 'three_point_shooting', 'ball_movement'],
      fanbaseRegions: ['North America', 'Asia'],
      successLevel: 'dominant',
      fanbaseSize: 'large',
      story: 'The Warriors revolutionized modern basketball with their "Splash Brothers" era, winning 4 championships and changing how the game is played with their three-point shooting prowess.',
      culture: 'The "Strength in Numbers" philosophy, beautiful ball movement, and passionate Bay Area fans.',
      winRate: 0.60,
      popularityScore: 95,
    },
  });

  const mavericks = await prisma.team.create({
    data: {
      leagueId: nbaLeague.id,
      name: 'Dallas Mavericks',
      shortName: 'Mavericks',
      city: 'Dallas',
      country: 'USA',
      foundedYear: 1980,
      logoUrl: 'https://via.placeholder.com/100?text=DAL',
      primaryColor: '#00538C',
      secondaryColor: '#002B5E',
      stadiumName: 'American Airlines Center',
      playstyle: ['offensive', 'european_style', 'pick_and_roll'],
      fanbaseRegions: ['North America', 'Europe'],
      successLevel: 'competitive',
      fanbaseSize: 'medium',
      story: 'Led by Luka Dončić, the Mavericks blend European flair with NBA athleticism. Their 2011 championship run was one of the greatest underdog stories in NBA history.',
      culture: 'International appeal, Mark Cuban\'s passionate ownership, and a focus on innovation.',
      winRate: 0.55,
      popularityScore: 80,
    },
  });

  // Create Soccer Teams
  const realMadrid = await prisma.team.create({
    data: {
      leagueId: laLiga.id,
      name: 'Real Madrid',
      shortName: 'Real Madrid',
      city: 'Madrid',
      country: 'Spain',
      foundedYear: 1902,
      logoUrl: 'https://via.placeholder.com/100?text=RM',
      primaryColor: '#FFFFFF',
      secondaryColor: '#00529F',
      stadiumName: 'Santiago Bernabéu',
      playstyle: ['attacking', 'possession', 'galactico'],
      fanbaseRegions: ['Europe', 'South America', 'Asia'],
      successLevel: 'dominant',
      fanbaseSize: 'massive',
      story: 'The most successful club in European football history with 14 Champions League titles. Real Madrid is synonymous with excellence, attracting the world\'s biggest stars.',
      culture: '\"The White House\" - a culture of winning, elegance, and never giving up.',
      winRate: 0.72,
      popularityScore: 100,
    },
  });

  const liverpool = await prisma.team.create({
    data: {
      leagueId: premierLeague.id,
      name: 'Liverpool FC',
      shortName: 'Liverpool',
      city: 'Liverpool',
      country: 'England',
      foundedYear: 1892,
      logoUrl: 'https://via.placeholder.com/100?text=LFC',
      primaryColor: '#C8102E',
      secondaryColor: '#00B2A9',
      stadiumName: 'Anfield',
      playstyle: ['high_press', 'attacking', 'intensity'],
      fanbaseRegions: ['Europe', 'Asia', 'North America'],
      successLevel: 'dominant',
      fanbaseSize: 'massive',
      story: 'Six-time European champions with one of the most passionate fanbases in world football. "You\'ll Never Walk Alone" echoes through Anfield on every matchday.',
      culture: 'Working-class roots, fierce loyalty, and the famous Kop stand atmosphere.',
      winRate: 0.68,
      popularityScore: 96,
    },
  });

  // Create Baseball Teams
  const yankees = await prisma.team.create({
    data: {
      leagueId: mlbLeague.id,
      name: 'New York Yankees',
      shortName: 'Yankees',
      city: 'New York',
      country: 'USA',
      foundedYear: 1901,
      logoUrl: 'https://via.placeholder.com/100?text=NYY',
      primaryColor: '#003087',
      secondaryColor: '#FFFFFF',
      stadiumName: 'Yankee Stadium',
      playstyle: ['power_hitting', 'traditional'],
      fanbaseRegions: ['North America'],
      successLevel: 'dominant',
      fanbaseSize: 'massive',
      story: 'The most successful franchise in MLB history with 27 World Series championships. The pinstripes represent baseball royalty.',
      culture: 'Tradition, excellence, and "The House That Ruth Built" legacy.',
      winRate: 0.57,
      popularityScore: 94,
    },
  });

  // Create F1 Teams
  const redBull = await prisma.team.create({
    data: {
      leagueId: f1League.id,
      name: 'Red Bull Racing',
      shortName: 'Red Bull',
      city: 'Milton Keynes',
      country: 'United Kingdom',
      foundedYear: 2005,
      logoUrl: 'https://via.placeholder.com/100?text=RBR',
      primaryColor: '#0600EF',
      secondaryColor: '#DC0000',
      playstyle: ['aggressive', 'innovative', 'dominant'],
      fanbaseRegions: ['Europe', 'Asia', 'Americas'],
      successLevel: 'dominant',
      fanbaseSize: 'large',
      story: 'Dominated the 2022-2024 era with Max Verstappen, combining innovative engineering with aggressive racing.',
      culture: 'Youth development, bold marketing, and relentless pursuit of performance.',
      winRate: 0.75,
      popularityScore: 92,
    },
  });

  const ferrari = await prisma.team.create({
    data: {
      leagueId: f1League.id,
      name: 'Scuderia Ferrari',
      shortName: 'Ferrari',
      city: 'Maranello',
      country: 'Italy',
      foundedYear: 1950,
      logoUrl: 'https://via.placeholder.com/100?text=Ferrari',
      primaryColor: '#DC0000',
      secondaryColor: '#FFFFFF',
      playstyle: ['traditional', 'passionate', 'Italian_flair'],
      fanbaseRegions: ['Europe', 'Global'],
      successLevel: 'competitive',
      fanbaseSize: 'massive',
      story: 'The most iconic team in F1 history. The Prancing Horse has been racing since the championship began, with legendary drivers like Schumacher and Lauda.',
      culture: 'Tifosi passion, Italian heritage, and the pressure to win for a nation.',
      winRate: 0.52,
      popularityScore: 98,
    },
  });

  console.log('✅ Created teams');

  // Create Players
  const lebron = await prisma.player.create({
    data: {
      teamId: lakers.id,
      firstName: 'LeBron',
      lastName: 'James',
      displayName: 'LeBron James',
      position: 'Forward',
      jerseyNumber: 23,
      nationality: 'USA',
      dateOfBirth: new Date('1984-12-30'),
      height: 206,
      weight: 113,
      imageUrl: 'https://via.placeholder.com/300?text=LeBron',
      playstyleTags: ['Playmaker', 'Clutch', 'Leader', 'All-Around'],
      narrative: 'LeBron James isn\'t just a basketball player—he\'s a cultural icon who has redefined what it means to be an athlete in the modern era. From his high school phenom days to four NBA championships across three franchises, LeBron has consistently delivered on impossible expectations. What makes him special isn\'t just his physical dominance, but his basketball IQ and ability to elevate everyone around him. Off the court, his "I Promise School" and activism have cemented his legacy beyond basketball.',
      achievements: [
        { year: 2003, title: 'NBA Draft #1 Pick', description: 'Selected by Cleveland Cavaliers' },
        { year: 2012, title: 'First NBA Championship', description: 'Won with Miami Heat' },
        { year: 2016, title: 'Cleveland Championship', description: 'Brought championship to Cleveland' },
        { year: 2020, title: 'Lakers Championship', description: 'Fourth championship with third team' },
      ],
      stats: {
        ppg: 27.2,
        apg: 7.5,
        rpg: 7.5,
        championships: 4,
        mvps: 4,
      },
      popularityScore: 99,
    },
  });

  const curry = await prisma.player.create({
    data: {
      teamId: warriors.id,
      firstName: 'Stephen',
      lastName: 'Curry',
      displayName: 'Stephen Curry',
      position: 'Guard',
      jerseyNumber: 30,
      nationality: 'USA',
      dateOfBirth: new Date('1988-03-14'),
      height: 188,
      weight: 84,
      imageUrl: 'https://via.placeholder.com/300?text=Curry',
      playstyleTags: ['Sniper', 'Revolutionary', 'Clutch', 'Showman'],
      narrative: 'Stephen Curry revolutionized basketball. Once considered too small and too weak for the NBA, he became the greatest shooter in history and changed how the game is played. His ability to make shots from anywhere on the court forced teams to completely redesign their defenses. Beyond the stats, Curry\'s joy for the game is infectious—his celebrations and smile have made him one of the most beloved players in the world.',
      achievements: [
        { year: 2015, title: 'First MVP', description: 'Regular season MVP' },
        { year: 2016, title: 'Unanimous MVP', description: 'Only unanimous MVP in NBA history' },
        { year: 2015, title: 'First Championship', description: 'Warriors dynasty begins' },
        { year: 2022, title: 'Finals MVP', description: 'Fourth championship, first Finals MVP' },
      ],
      stats: {
        ppg: 24.8,
        apg: 6.4,
        three_pointers_made: 3747,
        championships: 4,
        mvps: 2,
      },
      popularityScore: 97,
    },
  });

  const luka = await prisma.player.create({
    data: {
      teamId: mavericks.id,
      firstName: 'Luka',
      lastName: 'Dončić',
      displayName: 'Luka Dončić',
      position: 'Guard',
      jerseyNumber: 77,
      nationality: 'Slovenia',
      dateOfBirth: new Date('1999-02-28'),
      height: 201,
      weight: 104,
      imageUrl: 'https://via.placeholder.com/300?text=Luka',
      playstyleTags: ['Maestro', 'Step-Back King', 'Creative', 'Crafty'],
      narrative: 'Luka Dončić brought European basketball artistry to the NBA and immediately became a superstar. His step-back three is one of the most unstoppable moves in basketball, but it\'s his court vision and basketball IQ that truly set him apart. At just 25, he\'s already rewriting record books and leading the Mavericks back to championship contention. Fans love his competitive fire and the way he makes impossibly difficult plays look routine.',
      achievements: [
        { year: 2019, title: 'Rookie of the Year', description: 'NBA Rookie of the Year' },
        { year: 2020, title: 'First All-NBA Team', description: 'All-NBA First Team' },
        { year: 2024, title: 'Scoring Title', description: 'Led NBA in scoring' },
      ],
      stats: {
        ppg: 28.7,
        apg: 8.7,
        rpg: 8.3,
      },
      popularityScore: 93,
    },
  });

  const messi = await prisma.player.create({
    data: {
      firstName: 'Lionel',
      lastName: 'Messi',
      displayName: 'Lionel Messi',
      position: 'Forward',
      jerseyNumber: 10,
      nationality: 'Argentina',
      dateOfBirth: new Date('1987-06-24'),
      height: 170,
      weight: 72,
      imageUrl: 'https://via.placeholder.com/300?text=Messi',
      playstyleTags: ['GOAT', 'Dribbler', 'Playmaker', 'Magician'],
      narrative: 'Lionel Messi is widely considered the greatest footballer of all time. From his days at Barcelona\'s La Masia academy to winning the World Cup with Argentina, Messi has achieved everything in the sport. His left foot has produced more magic than seems physically possible—the dribbles, the goals, the assists. What fans love most is his humility despite being the best in the world.',
      achievements: [
        { year: 2009, title: 'First Ballon d\'Or', description: 'First of eight Ballon d\'Or awards' },
        { year: 2022, title: 'World Cup', description: 'Won FIFA World Cup with Argentina' },
        { year: 2021, title: 'Copa America', description: 'First major trophy with Argentina' },
      ],
      stats: {
        goals: 821,
        assists: 361,
        ballon_dor: 8,
      },
      popularityScore: 100,
    },
  });

  const salah = await prisma.player.create({
    data: {
      teamId: liverpool.id,
      firstName: 'Mohamed',
      lastName: 'Salah',
      displayName: 'Mohamed Salah',
      position: 'Forward',
      jerseyNumber: 11,
      nationality: 'Egypt',
      dateOfBirth: new Date('1992-06-15'),
      height: 175,
      weight: 71,
      imageUrl: 'https://via.placeholder.com/300?text=Salah',
      playstyleTags: ['Speedster', 'Clinical', 'Egyptian King'],
      narrative: 'Mohamed Salah is the pride of Egypt and one of the Premier League\'s deadliest forwards. His combination of pace, skill, and finishing has made him a Liverpool legend. Beyond his on-field brilliance, Salah has become a symbol of hope and inspiration for millions in the Arab world.',
      achievements: [
        { year: 2018, title: 'Premier League Golden Boot', description: 'Top scorer in Premier League' },
        { year: 2019, title: 'Champions League', description: 'Won with Liverpool' },
      ],
      stats: {
        goals: 214,
        assists: 92,
      },
      popularityScore: 95,
    },
  });

  const verstappen = await prisma.player.create({
    data: {
      teamId: redBull.id,
      firstName: 'Max',
      lastName: 'Verstappen',
      displayName: 'Max Verstappen',
      position: 'Driver',
      jerseyNumber: 1,
      nationality: 'Netherlands',
      dateOfBirth: new Date('1997-09-30'),
      imageUrl: 'https://via.placeholder.com/300?text=Max',
      playstyleTags: ['Aggressive', 'Precise', 'Fearless'],
      narrative: 'Max Verstappen has dominated Formula 1 with a combination of raw speed, racecraft, and mental strength. His wheel-to-wheel battles are legendary, and his consistency is unmatched. Fans love his no-nonsense attitude and pure racing instinct.',
      achievements: [
        { year: 2021, title: 'First World Championship', description: 'Controversial but deserved title' },
        { year: 2022, title: 'Dominant Season', description: '15 race wins' },
        { year: 2023, title: 'Record-Breaking Season', description: '19 race wins' },
      ],
      stats: {
        race_wins: 54,
        championships: 3,
        podiums: 103,
      },
      popularityScore: 94,
    },
  });

  console.log('✅ Created players');

  // Create Rules
  await prisma.rule.create({
    data: {
      sportId: soccer.id,
      title: 'Offside Rule',
      slug: 'offside',
      category: 'basic',
      difficulty: 7,
      description: 'Understanding when a player is in an offside position',
      explanation: 'A player is in an offside position if they are nearer to the opponent\'s goal line than both the ball and the second-last opponent when the ball is played to them. However, being in an offside position is not an offense in itself.',
      visualizationType: 'svg_interactive',
      visualConfig: {
        type: 'soccer_field',
        interactive: true,
        elements: ['ball', 'attacker', 'defenders', 'goal_line'],
      },
    },
  });

  await prisma.rule.create({
    data: {
      sportId: baseball.id,
      title: 'Strike Zone',
      slug: 'strike-zone',
      category: 'basic',
      difficulty: 6,
      description: 'Understanding the strike zone in baseball',
      explanation: 'The strike zone is the area over home plate from the midpoint between a batter\'s shoulders and the top of the uniform pants, down to the hollow beneath the kneecap. A pitch through this zone is a strike if the batter doesn\'t swing.',
      visualizationType: 'canvas_simulation',
      visualConfig: {
        type: 'strike_zone',
        interactive: true,
        show_pitches: true,
      },
    },
  });

  await prisma.rule.create({
    data: {
      sportId: basketball.id,
      title: 'Shot Clock & Three-Point Line',
      slug: 'shot-clock-three-point',
      category: 'basic',
      difficulty: 4,
      description: 'Understanding the 24-second shot clock and three-point line',
      explanation: 'Teams must attempt a shot within 24 seconds of gaining possession. Shots made beyond the three-point arc (23.75 feet in the NBA) count for three points instead of two.',
      visualizationType: 'svg_interactive',
      visualConfig: {
        type: 'basketball_court',
        interactive: true,
        show_shot_clock: true,
        show_three_point_line: true,
      },
    },
  });

  await prisma.rule.create({
    data: {
      sportId: f1.id,
      title: 'Flag Meanings',
      slug: 'flag-meanings',
      category: 'basic',
      difficulty: 5,
      description: 'Understanding F1 flag signals',
      explanation: 'Flags communicate race conditions: Yellow (caution), Red (stopped), Green (clear), Blue (being lapped), Black (disqualification), Checkered (finish).',
      visualizationType: 'svg_interactive',
      visualConfig: {
        type: 'flag_quiz',
        flags: ['yellow', 'red', 'green', 'blue', 'black', 'checkered'],
      },
    },
  });

  await prisma.rule.create({
    data: {
      sportId: cricket.id,
      title: 'LBW (Leg Before Wicket)',
      slug: 'lbw',
      category: 'intermediate',
      difficulty: 8,
      description: 'Understanding the LBW dismissal',
      explanation: 'A batsman is out LBW if the ball hits their leg (or body) when it would have otherwise hit the stumps, provided certain conditions are met regarding where the ball pitched and where it hit the batsman.',
      visualizationType: 'svg_interactive',
      visualConfig: {
        type: 'cricket_pitch',
        show_trajectory: true,
      },
    },
  });

  console.log('✅ Created rules');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
