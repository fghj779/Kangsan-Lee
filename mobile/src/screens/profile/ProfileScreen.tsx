/**
 * Profile screen with collection showcase and reputation
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

export default function ProfileScreen({ navigation }: any) {
  const mockUser = {
    username: 'collector_pro',
    email: 'collector@example.com',
    bio: 'Passionate football jersey collector. Specializing in 90s-2000s era kits.',
    favorite_clubs: ['FC Barcelona', 'Manchester United', 'K-League'],
    contribution_score: 247,
    total_posts: 89,
    total_verifications: 12,
    reputation_positive: 47,
    reputation_neutral: 3,
    reputation_negative: 0,
    collection_count: 156,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person-circle" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.username}>{mockUser.username}</Text>
        <Text style={styles.email}>{mockUser.email}</Text>
        {mockUser.bio && <Text style={styles.bio}>{mockUser.bio}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Clubs</Text>
        <View style={styles.clubsContainer}>
          {mockUser.favorite_clubs.map((club, index) => (
            <View key={index} style={styles.clubBadge}>
              <Icon name="shield" size={14} color={COLORS.primary} />
              <Text style={styles.clubText}>{club}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reputation</Text>
        <View style={styles.reputationContainer}>
          <View style={styles.reputationItem}>
            <Icon name="thumbs-up" size={20} color={COLORS.reputationPositive} />
            <Text style={[styles.reputationNumber, { color: COLORS.reputationPositive }]}>
              {mockUser.reputation_positive}
            </Text>
            <Text style={styles.reputationLabel}>Positive</Text>
          </View>
          <View style={styles.reputationItem}>
            <Icon name="thumbs-up" size={20} color={COLORS.reputationNeutral} />
            <Text style={[styles.reputationNumber, { color: COLORS.reputationNeutral }]}>
              {mockUser.reputation_neutral}
            </Text>
            <Text style={styles.reputationLabel}>Neutral</Text>
          </View>
          <View style={styles.reputationItem}>
            <Icon name="thumbs-down" size={20} color={COLORS.reputationNegative} />
            <Text style={[styles.reputationNumber, { color: COLORS.reputationNegative }]}>
              {mockUser.reputation_negative}
            </Text>
            <Text style={styles.reputationLabel}>Negative</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Contribution</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="chatbubbles" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{mockUser.total_posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{mockUser.total_verifications}</Text>
            <Text style={styles.statLabel}>Verifications</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trophy" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>{mockUser.contribution_score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.collectionButton}
        onPress={() => navigation.navigate('Collection')}
      >
        <Icon name="shirt" size={20} color={COLORS.text} />
        <Text style={styles.collectionButtonText}>
          View Collection ({mockUser.collection_count} items)
        </Text>
        <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Icon name="settings" size={20} color={COLORS.textSecondary} />
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  username: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  bio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  clubsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: 6,
  },
  reputationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
  },
  reputationItem: {
    alignItems: 'center',
  },
  reputationNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  reputationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
  },
  collectionButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
});
