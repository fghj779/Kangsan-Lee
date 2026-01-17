/**
 * Board detail screen showing posts
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

export default function BoardDetailScreen({ route, navigation }: any) {
  const { board } = route.params;

  const mockPosts = [
    {
      id: 1,
      title: '2023/24 Home Kit Review - Excellent Quality',
      author: 'collector123',
      replies: 24,
      views: 432,
      category: 'review',
      is_pinned: true,
    },
    {
      id: 2,
      title: 'Is this authentic? Photos inside',
      author: 'newbie99',
      replies: 12,
      views: 156,
      category: 'verification',
      is_pinned: false,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'review': return COLORS.categoryReview;
      case 'verification': return COLORS.categoryVerification;
      case 'discussion': return COLORS.categoryDiscussion;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.boardName}>{board.name}</Text>
        <Text style={styles.boardDescription}>{board.description}</Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost', { board })}
      >
        <Icon name="add-circle" size={20} color={COLORS.text} />
        <Text style={styles.createButtonText}>New Post</Text>
      </TouchableOpacity>

      <FlatList
        data={mockPosts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          >
            {item.is_pinned && (
              <View style={styles.pinnedBadge}>
                <Icon name="pin" size={12} color={COLORS.primary} />
                <Text style={styles.pinnedText}>Pinned</Text>
              </View>
            )}
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.postAuthor}>by {item.author}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <View style={styles.postStats}>
              <View style={styles.stat}>
                <Icon name="chatbubble-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{item.replies}</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="eye-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{item.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  boardName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
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
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pinnedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});
