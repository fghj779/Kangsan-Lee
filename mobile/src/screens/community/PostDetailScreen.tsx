/**
 * Post detail screen with comments
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

export default function PostDetailScreen({ route }: any) {
  const { post } = route.params;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'expert_collector',
      content: 'Great review! I have the same jersey and the quality is indeed excellent. The stitching on the badge is particularly well done.',
      created_at: '2 hours ago',
    },
    {
      id: 2,
      author: 'jersey_fan',
      content: 'Thanks for sharing. How does it fit compared to previous seasons?',
      created_at: '1 hour ago',
    },
  ]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        author: 'current_user',
        content: commentText,
        created_at: 'Just now',
      };
      setComments([...comments, newComment]);
      setCommentText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <View style={styles.postMeta}>
            <View style={styles.authorInfo}>
              <Icon name="person-circle" size={20} color={COLORS.textSecondary} />
              <Text style={styles.authorName}>{post.author}</Text>
            </View>
            <Text style={styles.timestamp}>3 hours ago</Text>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.contentText}>
            Just received my 2023/24 home kit and wanted to share my thoughts with the community.
            {'\n\n'}
            <Text style={styles.boldText}>Quality:</Text> The material is excellent - feels premium and authentic.
            The Nike Dri-FIT technology really works well. No complaints here.
            {'\n\n'}
            <Text style={styles.boldText}>Sizing:</Text> True to size. I ordered Large and it fits perfectly.
            For reference, I'm 180cm and 75kg.
            {'\n\n'}
            <Text style={styles.boldText}>Details:</Text> All badges are heat-pressed, not stitched.
            The club crest looks great and the sponsor logo is properly aligned.
            {'\n\n'}
            <Text style={styles.boldText}>Price:</Text> Paid $90 from official store. Worth it for the quality.
            {'\n\n'}
            Overall rating: 9/10. Highly recommend for serious collectors.
          </Text>
        </View>

        {/* Post Stats */}
        <View style={styles.postActions}>
          <View style={styles.stat}>
            <Icon name="eye-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{post.views} views</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{post.replies} replies</Text>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Discussion</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthor}>
                  <Icon name="person-circle" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.commentAuthorName}>{comment.author}</Text>
                </View>
                <Text style={styles.commentTime}>{comment.created_at}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add to the discussion..."
          placeholderTextColor={COLORS.textSecondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim()}
        >
          <Icon name="send" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
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
  postHeader: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  postContent: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
  },
  contentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginTop: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  commentsSection: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  commentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthorName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  commentContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
});
