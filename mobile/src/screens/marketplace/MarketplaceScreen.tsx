/**
 * Marketplace screen - Trust-based jersey marketplace
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

interface Listing {
  id: number;
  title: string;
  club_name: string;
  season: string;
  price: number;
  condition: string;
  seller_username: string;
  seller_reputation_score: number;
  image_url?: string;
  is_negotiable: boolean;
}

export default function MarketplaceScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const mockListings: Listing[] = [
    {
      id: 1,
      title: 'FC Barcelona 2011/12 Home - Messi #10',
      club_name: 'FC Barcelona',
      season: '2011/12',
      price: 450,
      condition: 'excellent',
      seller_username: 'collector_pro',
      seller_reputation_score: 47,
      is_negotiable: true,
    },
    {
      id: 2,
      title: 'Manchester United 1999 CL Final - Match Worn',
      club_name: 'Manchester United',
      season: '1998/99',
      price: 1200,
      condition: 'very_good',
      seller_username: 'vintage_jerseys',
      seller_reputation_score: 89,
      is_negotiable: false,
    },
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new_with_tags': return COLORS.success;
      case 'excellent': return COLORS.reputationPositive;
      case 'very_good': return COLORS.categoryReview;
      case 'good': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listing: item })}
    >
      <View style={styles.imagePlaceholder}>
        <Icon name="shirt" size={40} color={COLORS.textSecondary} />
      </View>

      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.listingMeta}>
          <Text style={styles.clubName}>{item.club_name}</Text>
          <Text style={styles.season}>{item.season}</Text>
        </View>

        <View style={styles.conditionRow}>
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: getConditionColor(item.condition) + '20' },
            ]}
          >
            <Text
              style={[
                styles.conditionText,
                { color: getConditionColor(item.condition) },
              ]}
            >
              {item.condition.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.listingFooter}>
          <View>
            <Text style={styles.price}>${item.price}</Text>
            {item.is_negotiable && (
              <Text style={styles.negotiable}>Negotiable</Text>
            )}
          </View>

          <View style={styles.sellerInfo}>
            <Icon
              name="person-circle"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.sellerName}>{item.seller_username}</Text>
            <View style={styles.reputationBadge}>
              <Icon name="star" size={12} color={COLORS.success} />
              <Text style={styles.reputationScore}>
                {item.seller_reputation_score}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jerseys..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity>
          <Icon name="options" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Icon name="add-circle" size={20} color={COLORS.text} />
        <Text style={styles.createButtonText}>List Item</Text>
      </TouchableOpacity>

      <FlatList
        data={mockListings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
  },
  listingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingContent: {
    padding: SPACING.md,
  },
  listingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clubName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  season: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  conditionRow: {
    marginBottom: SPACING.sm,
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  negotiable: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    marginTop: 2,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
    marginRight: SPACING.sm,
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reputationScore: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    marginLeft: 2,
    fontWeight: '600',
  },
});
