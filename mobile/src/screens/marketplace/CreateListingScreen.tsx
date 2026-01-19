/**
 * Create listing screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

const JERSEY_VERSIONS = ['replica', 'player_issue', 'match_worn'];
const CONDITIONS = ['new_with_tags', 'excellent', 'very_good', 'good', 'fair'];

export default function CreateListingScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [clubName, setClubName] = useState('');
  const [season, setSeason] = useState('');
  const [price, setPrice] = useState('');
  const [jerseyVersion, setJerseyVersion] = useState('replica');
  const [condition, setCondition] = useState('excellent');
  const [description, setDescription] = useState('');
  const [provenance, setProvenance] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);

  const handleCreate = () => {
    if (!title.trim() || !clubName.trim() || !season.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!provenance.trim()) {
      Alert.alert(
        'Provenance Required',
        'Please provide information about where you purchased this jersey. This helps build trust in the community.'
      );
      return;
    }

    Alert.alert(
      'Success',
      'Your listing has been created! It may take a few moments to appear in the marketplace.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.pageTitle}>List Your Jersey</Text>
          <Text style={styles.subtitle}>
            Share details about your jersey to help buyers make informed decisions
          </Text>

          {/* Photo Upload Placeholder */}
          <View style={styles.section}>
            <Text style={styles.label}>Photos * (Front, Back, Details)</Text>
            <View style={styles.photoUpload}>
              <Text style={styles.photoText}>+ Add Photos</Text>
              <Text style={styles.photoHint}>Required: 3-8 clear photos</Text>
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., FC Barcelona 2011/12 Home - Messi #10"
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>Club Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., FC Barcelona"
                placeholderTextColor={COLORS.textSecondary}
                value={clubName}
                onChangeText={setClubName}
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: SPACING.sm }]}>
              <Text style={styles.label}>Season *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2023/24"
                placeholderTextColor={COLORS.textSecondary}
                value={season}
                onChangeText={setSeason}
              />
            </View>
          </View>

          {/* Jersey Version */}
          <View style={styles.section}>
            <Text style={styles.label}>Jersey Version *</Text>
            <View style={styles.optionsRow}>
              {JERSEY_VERSIONS.map((version) => (
                <TouchableOpacity
                  key={version}
                  style={[
                    styles.optionButton,
                    jerseyVersion === version && styles.optionButtonSelected,
                  ]}
                  onPress={() => setJerseyVersion(version)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      jerseyVersion === version && styles.optionTextSelected,
                    ]}
                  >
                    {version.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={styles.label}>Condition *</Text>
            <View style={styles.optionsRow}>
              {CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[
                    styles.optionButton,
                    condition === cond && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCondition(cond)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      condition === cond && styles.optionTextSelected,
                    ]}
                  >
                    {cond.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsNegotiable(!isNegotiable)}
            >
              <View style={[styles.checkboxBox, isNegotiable && styles.checkboxChecked]}>
                {isNegotiable && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Price is negotiable</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the jersey condition, size, fit, any details buyers should know..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              maxLength={2000}
            />
          </View>

          {/* Provenance */}
          <View style={styles.section}>
            <Text style={styles.label}>Provenance (Purchase Source) *</Text>
            <Text style={styles.hint}>
              Where did you purchase this jersey? (e.g., Official club store,
              Nike.com, etc.) This helps build trust.
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Purchased from official FC Barcelona store in 2023. Can provide receipt."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              value={provenance}
              onChangeText={setProvenance}
              maxLength={500}
            />
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesBox}>
            <Text style={styles.guidelinesTitle}>Listing Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Provide clear, well-lit photos from multiple angles{'\n'}
              • Be honest about condition and any flaws{'\n'}
              • Include proof of purchase when possible{'\n'}
              • Respond promptly to buyer questions{'\n'}
              • Ship items carefully and as described
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                (!title.trim() || !clubName.trim() || !price.trim()) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!title.trim() || !clubName.trim() || !price.trim()}
            >
              <Text style={styles.createButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  photoUpload: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  guidelinesBox: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  guidelinesTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  guidelinesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  createButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
