import { cosineSimilarity, teamToVector, PreferenceVector, TeamVector } from '@/lib/recommender';
import { quizToPreferenceVector } from '@/lib/quiz';
import { Team } from '@prisma/client';

describe('Recommender System', () => {
  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const userVector: PreferenceVector = {
        offensive: 0.8,
        defensive: 0.3,
        fastPaced: 0.9,
        strategic: 0.4,
        dominant: 0.7,
        underdog: 0.2,
        sportWeights: {},
        regionWeights: {},
        speed: 0.6,
        teamwork: 0.5,
        individual: 0.3,
        strategy: 0.4,
      };

      const teamVector: TeamVector = {
        offensive: 0.8,
        defensive: 0.3,
        fastPaced: 0.9,
        strategic: 0.4,
        dominance: 0.7,
        underdog: 0.2,
        sportId: 'test',
        region: 'test',
        popularityScore: 80,
        fanbaseSize: 3,
      };

      const similarity = cosineSimilarity(userVector, teamVector);
      expect(similarity).toBeCloseTo(1.0, 1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const userVector: PreferenceVector = {
        offensive: 1.0,
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
        strategy: 0,
      };

      const teamVector: TeamVector = {
        offensive: 0,
        defensive: 1.0,
        fastPaced: 0,
        strategic: 0,
        dominance: 0,
        underdog: 0,
        sportId: 'test',
        region: 'test',
        popularityScore: 50,
        fanbaseSize: 2,
      };

      const similarity = cosineSimilarity(userVector, teamVector);
      expect(similarity).toBeCloseTo(0, 1);
    });

    it('should handle zero vectors', () => {
      const userVector: PreferenceVector = {
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
        strategy: 0,
      };

      const teamVector: TeamVector = {
        offensive: 0.5,
        defensive: 0.5,
        fastPaced: 0.5,
        strategic: 0.5,
        dominance: 0.5,
        underdog: 0.5,
        sportId: 'test',
        region: 'test',
        popularityScore: 50,
        fanbaseSize: 2,
      };

      const similarity = cosineSimilarity(userVector, teamVector);
      expect(similarity).toBe(0);
    });
  });

  describe('teamToVector', () => {
    it('should convert team attributes to vector correctly', () => {
      const team = {
        id: 'test',
        leagueId: 'league1',
        name: 'Test Team',
        shortName: 'TEST',
        city: 'Test City',
        country: 'USA',
        foundedYear: 2000,
        logoUrl: null,
        primaryColor: null,
        secondaryColor: null,
        stadiumName: null,
        playstyle: ['offensive', 'fast_paced'],
        fanbaseRegions: ['North America'],
        successLevel: 'dominant',
        fanbaseSize: 'massive',
        story: null,
        culture: null,
        winRate: 0.7,
        popularityScore: 90,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Team;

      const vector = teamToVector(team);

      expect(vector.offensive).toBeGreaterThan(0.8);
      expect(vector.fastPaced).toBeGreaterThan(0.8);
      expect(vector.dominance).toBeGreaterThan(0.8);
      expect(vector.fanbaseSize).toBe(4); // massive = 4
    });

    it('should handle teams with minimal attributes', () => {
      const team = {
        id: 'test',
        leagueId: 'league1',
        name: 'Test Team',
        shortName: 'TEST',
        city: null,
        country: 'USA',
        foundedYear: null,
        logoUrl: null,
        primaryColor: null,
        secondaryColor: null,
        stadiumName: null,
        playstyle: [],
        fanbaseRegions: [],
        successLevel: 'mid',
        fanbaseSize: 'small',
        story: null,
        culture: null,
        winRate: 0.5,
        popularityScore: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Team;

      const vector = teamToVector(team);

      expect(vector.offensive).toBeLessThan(0.5);
      expect(vector.dominance).toBeLessThan(0.5);
      expect(vector.fanbaseSize).toBe(1); // small = 1
    });
  });
});

describe('Quiz Scoring', () => {
  describe('quizToPreferenceVector', () => {
    it('should convert quiz responses to preference vector', () => {
      const responses = [
        {
          questionId: 'sports_interest',
          answers: ['NBA', 'Soccer'],
        },
        {
          questionId: 'excitement_factors',
          answers: ['speed', 'strategy'],
        },
        {
          questionId: 'preferred_pace',
          answers: 'fast',
        },
        {
          questionId: 'team_personality',
          answers: 'dominant',
        },
        {
          questionId: 'playstyle_preference',
          answers: 'offensive',
        },
      ];

      const vector = quizToPreferenceVector(responses);

      expect(vector.sportWeights['NBA']).toBe(0.5);
      expect(vector.sportWeights['Soccer']).toBe(0.5);
      expect(vector.fastPaced).toBeGreaterThan(0.5);
      expect(vector.speed).toBeGreaterThan(0);
      expect(vector.strategy).toBeGreaterThan(0);
      expect(vector.dominant).toBe(0.8);
      expect(vector.offensive).toBe(0.9);
    });

    it('should handle minimal responses', () => {
      const responses = [
        {
          questionId: 'sports_interest',
          answers: ['NBA'],
        },
      ];

      const vector = quizToPreferenceVector(responses);

      expect(vector.sportWeights['NBA']).toBe(1.0);
    });

    it('should normalize values to [0, 1]', () => {
      const responses = [
        {
          questionId: 'excitement_factors',
          answers: ['speed', 'strategy', 'team_chemistry', 'individual_brilliance'],
        },
        {
          questionId: 'preferred_pace',
          answers: 'fast',
        },
      ];

      const vector = quizToPreferenceVector(responses);

      // All values should be <= 1.0
      expect(vector.fastPaced).toBeLessThanOrEqual(1.0);
      expect(vector.strategic).toBeLessThanOrEqual(1.0);
      expect(vector.speed).toBeLessThanOrEqual(1.0);
      expect(vector.teamwork).toBeLessThanOrEqual(1.0);
    });
  });
});
