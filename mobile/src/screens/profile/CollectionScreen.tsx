/**
 * Collection showcase screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

interface CollectionItem {
  id: number;
  club_name: string;
  season: string;
  jersey_version: string;
  notes?: string;
  display_order: number;
}

export default function CollectionScreen({ navigation }: any) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [clubName, setClubName] = useState('');
  const [season, setSeason] = useState('');

  const [collection, setCollection] = useState<CollectionItem[]>([
    {
      id: 1,
      club_name: 'FC Barcelona',
      season: '2011/12',
      jersey_version: 'Replica',
      notes: 'Classic treble-winning season kit',
      display_order: 1,
    },
    {
      id: 2,
      club_name: 'Manchester United',
      season: '1999',
      jersey_version: 'Player Issue',
      notes: 'Champions League Final - Treble season',
      display_order: 2,
    },
    {
      id: 3,
      club_name: 'Suwon Samsung Bluewings',
      season: '2008',
      jersey_version: 'Replica',
      notes: 'K-League championship season',
      display_order: 3,
    },
  ]);

  const handleAddToCollection = () => {
    if (!clubName.trim() || !season.trim()) {
      Alert.alert('Error', 'Please fill in club name and season');
      return;
    }

    const newItem: CollectionItem = {
      id: collection.length + 1,
      club_name: clubName,
      season: season,
      jersey_version: 'Replica',
      display_order: collection.length + 1,
    };

    setCollection([...collection, newItem]);
    setClubName('');
    setSeason('');
    setAddModalVisible(false);
    Alert.alert('Success', 'Added to your collection!');
  };

  const getVersionColor = (version: string) => {
    switch (version.toLowerCase()) {
      case 'match worn':
        return COLORS.success;
      case 'player issue':
        return COLORS.primary;
      default:
        return COLORS.categoryReview;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Collection</Text>
          <Text style={styles.subtitle}>{collection.length} jerseys</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Icon name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {collection.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              {/* Jersey Icon */}
              <View style={styles.itemImage}>
                <Icon name="shirt" size={40} color={COLORS.primary} />
              </View>

              {/* Item Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemClub}>{item.club_name}</Text>
                <Text style={styles.itemSeason}>{item.season}</Text>

                <View
                  style={[
                    styles.versionBadge,
                    { backgroundColor: getVersionColor(item.jersey_version) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.versionText,
                      { color: getVersionColor(item.jersey_version) },
                    ]}
                  >
                    {item.jersey_version}
                  </Text>
                </View>

                {item.notes && (
                  <Text style={styles.itemNotes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="create-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    Alert.alert(
                      'Remove from Collection',
                      `Remove ${item.club_name} ${item.season}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => {
                            setCollection(collection.filter((i) => i.id !== item.id));
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {collection.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="shirt-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Your collection is empty</Text>
            <Text style={styles.emptyHint}>
              Start adding jerseys to showcase your collection
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Add Your First Jersey</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.collectionInfo}>
          <Text style={styles.infoTitle}>About Collections</Text>
          <Text style={styles.infoText}>
            Your collection showcases jerseys you own, separate from items you're selling.
            Share your passion and connect with fellow collectors!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Collection Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Collection</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Club Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., FC Barcelona"
              placeholderTextColor={COLORS.textSecondary}
              value={clubName}
              onChangeText={setClubName}
            />

            <Text style={styles.modalLabel}>Season *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 2023/24"
              placeholderTextColor={COLORS.textSecondary}
              value={season}
              onChangeText={setSeason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleAddToCollection}
              >
                <Text style={styles.modalSubmitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: SPACING.md,
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImage: {
    height: 100,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  itemInfo: {
    marginBottom: SPACING.sm,
  },
  itemClub: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemSeason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  itemNotes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  iconButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    marginTop: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  collectionInfo: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
