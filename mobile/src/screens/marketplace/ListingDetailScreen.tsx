/**
 * Listing detail screen with offer system
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

export default function ListingDetailScreen({ route }: any) {
  const { listing } = route.params;
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const handleMakeOffer = () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid offer amount');
      return;
    }

    Alert.alert(
      'Offer Sent',
      `Your offer of $${offerAmount} has been sent to the seller. They will review it and respond soon.`,
      [{ text: 'OK', onPress: () => setOfferModalVisible(false) }]
    );
    setOfferAmount('');
    setOfferMessage('');
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new_with_tags':
        return COLORS.success;
      case 'excellent':
        return COLORS.reputationPositive;
      case 'very_good':
        return COLORS.categoryReview;
      case 'good':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Placeholder */}
        <View style={styles.imageContainer}>
          <Icon name="shirt" size={80} color={COLORS.textSecondary} />
          <Text style={styles.imageHint}>Front • Back • Details</Text>
        </View>

        {/* Title and Price */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.clubName}>{listing.club_name}</Text>
              <Text style={styles.season}>{listing.season}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>${listing.price}</Text>
            {listing.is_negotiable && (
              <Text style={styles.negotiable}>Negotiable</Text>
            )}
          </View>
        </View>

        {/* Condition Badge */}
        <View style={styles.infoSection}>
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: getConditionColor(listing.condition) + '20' },
            ]}
          >
            <Icon
              name="checkmark-circle"
              size={16}
              color={getConditionColor(listing.condition)}
            />
            <Text
              style={[
                styles.conditionText,
                { color: getConditionColor(listing.condition) },
              ]}
            >
              Condition: {listing.condition.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <Icon name="person-circle" size={40} color={COLORS.primary} />
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{listing.seller_username}</Text>
                <View style={styles.reputationRow}>
                  <Icon name="star" size={14} color={COLORS.success} />
                  <Text style={styles.reputationText}>
                    {listing.seller_reputation_score} positive reviews
                  </Text>
                </View>
                <Text style={styles.memberSince}>Member since 2022</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileText}>View Profile</Text>
              <Icon name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Authentic {listing.club_name} jersey from the {listing.season} season.
            {'\n\n'}
            <Text style={styles.bold}>Size:</Text> Large (fits true to size)
            {'\n\n'}
            <Text style={styles.bold}>Manufacturer:</Text> Nike
            {'\n\n'}
            <Text style={styles.bold}>Provenance:</Text> Purchased from official club
            store with receipt. Can provide proof of purchase upon request.
            {'\n\n'}
            <Text style={styles.bold}>Condition Details:</Text> Worn only a few
            times, no visible wear or damage. All tags and badges intact. Washed
            following care instructions.
            {'\n\n'}
            <Text style={styles.bold}>Shipping:</Text> Carefully packaged and shipped
            within 2-3 business days.
          </Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={styles.detailsGrid}>
            <DetailItem icon="shirt" label="Version" value="Replica" />
            <DetailItem icon="resize" label="Size" value="Large" />
            <DetailItem icon="calendar" label="Season" value={listing.season} />
            <DetailItem icon="shield-checkmark" label="Authenticity" value="Verified" />
          </View>
        </View>

        {/* Questions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions & Answers</Text>
          <QuestionCard
            author="collector123"
            question="Does this come with original tags?"
            answer="Yes, all original tags are included!"
            answered_by={listing.seller_username}
          />
          <QuestionCard
            author="new_buyer"
            question="Can you ship internationally?"
            answer="Yes, I can ship worldwide. Shipping costs vary by location."
            answered_by={listing.seller_username}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.messageButton}>
          <Icon name="chatbubble-outline" size={20} color={COLORS.text} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.offerButton}
          onPress={() => setOfferModalVisible(true)}
        >
          <Icon name="cash-outline" size={20} color={COLORS.text} />
          <Text style={styles.offerButtonText}>Make Offer</Text>
        </TouchableOpacity>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setOfferModalVisible(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Asking Price: ${listing.price}
            </Text>

            <Text style={styles.modalLabel}>Your Offer ($)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={offerAmount}
              onChangeText={setOfferAmount}
            />

            <Text style={styles.modalLabel}>Message (Optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Add a message to explain your offer..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              value={offerMessage}
              onChangeText={setOfferMessage}
              maxLength={300}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setOfferModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleMakeOffer}
              >
                <Text style={styles.modalSubmitText}>Send Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <View style={styles.detailItem}>
      <Icon name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function QuestionCard({ author, question, answer, answered_by }: any) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <Icon name="help-circle-outline" size={16} color={COLORS.primary} />
        <Text style={styles.questionAuthor}>{author}</Text>
      </View>
      <Text style={styles.questionText}>Q: {question}</Text>
      {answer && (
        <View style={styles.answerSection}>
          <Text style={styles.answerText}>A: {answer}</Text>
          <Text style={styles.answeredBy}>— {answered_by}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  titleSection: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  price: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  negotiable: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: 4,
  },
  infoSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  sellerSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sellerCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sellerInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  sellerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  sellerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  reputationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reputationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  memberSince: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  viewProfileText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  detailItem: {
    width: '47%',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  questionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  questionAuthor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  questionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  answerSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  answerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  answeredBy: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  offerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  offerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
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
  modalHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
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
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
