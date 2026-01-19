/**
 * Create post screen
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

const CATEGORIES = [
  { value: 'discussion', label: 'Discussion', color: COLORS.categoryDiscussion },
  { value: 'review', label: 'Review', color: COLORS.categoryReview },
  { value: 'verification', label: 'Verification', color: COLORS.categoryVerification },
  { value: 'question', label: 'Question', color: COLORS.categoryQuestion },
  { value: 'news', label: 'News', color: COLORS.categoryNews },
];

export default function CreatePostScreen({ route, navigation }: any) {
  const { board } = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('discussion');

  const handlePost = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter post content');
      return;
    }

    if (title.length < 10) {
      Alert.alert('Error', 'Title must be at least 10 characters');
      return;
    }

    if (content.length < 50) {
      Alert.alert('Error', 'Post content must be at least 50 characters for quality discussion');
      return;
    }

    // Mock post creation
    Alert.alert(
      'Success',
      'Your post has been published!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Board Info */}
          <View style={styles.boardInfo}>
            <Text style={styles.label}>Posting to:</Text>
            <Text style={styles.boardName}>{board.name}</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.value && {
                      borderColor: category.color,
                      backgroundColor: category.color + '20',
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.value && { color: category.color, fontWeight: 'bold' },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter a clear, descriptive title..."
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
            <Text style={styles.charCount}>{title.length}/200</Text>
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.label}>Content *</Text>
            <Text style={styles.hint}>
              Share your thoughts, ask questions, or provide detailed reviews.
              Quality posts encourage better discussions.
            </Text>
            <TextInput
              style={styles.contentInput}
              placeholder={`Share your thoughts about ${board.name}...\n\nFor reviews, consider including:\n• Quality assessment\n• Sizing information\n• Authenticity details\n• Price and value\n• Overall recommendation`}
              placeholderTextColor={COLORS.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.charCount}>{content.length}/5000</Text>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesBox}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful to other members{'\n'}
              • Provide detailed, helpful information{'\n'}
              • Use appropriate categories{'\n'}
              • No spam or self-promotion{'\n'}
              • Share authentic experiences
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!title.trim() || !content.trim()) && styles.postButtonDisabled,
              ]}
              onPress={handlePost}
              disabled={!title.trim() || !content.trim()}
            >
              <Text style={styles.postButtonText}>Publish Post</Text>
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
  boardInfo: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  boardName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  titleInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  contentInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 300,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
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
  postButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  postButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
