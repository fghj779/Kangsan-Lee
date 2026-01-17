/**
 * Community boards screen - Forum-first layout with club-specific boards
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES } from '../../theme/colors';

interface Board {
  id: number;
  name: string;
  description: string;
  club_name?: string;
  total_posts: number;
  board_type: string;
}

export default function CommunityScreen({ navigation }: any) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    // Mock data - replace with API call
    const mockBoards: Board[] = [
      {
        id: 1,
        name: 'FC Barcelona',
        description: 'Discuss Barca kits, history, and collections',
        club_name: 'FC Barcelona',
        total_posts: 1243,
        board_type: 'club_discussion',
      },
      {
        id: 2,
        name: 'Manchester United',
        description: 'Red Devils kit discussion and authenticity checks',
        club_name: 'Manchester United',
        total_posts: 987,
        board_type: 'club_discussion',
      },
      {
        id: 3,
        name: 'K-League Boards',
        description: 'Korean football league jerseys and memorabilia',
        club_name: 'K-League',
        total_posts: 456,
        board_type: 'club_discussion',
      },
      {
        id: 4,
        name: 'Real or Fake?',
        description: 'Community authentication and verification',
        total_posts: 2134,
        board_type: 'authenticity',
      },
      {
        id: 5,
        name: 'Match Worn Analysis',
        description: 'Discussion of player-worn and match-issued kits',
        total_posts: 678,
        board_type: 'match_worn',
      },
    ];

    setTimeout(() => {
      setBoards(mockBoards);
      setLoading(false);
    }, 500);
  };

  const getBoardIcon = (type: string) => {
    switch (type) {
      case 'club_discussion':
        return 'shield';
      case 'authenticity':
        return 'checkmark-circle';
      case 'match_worn':
        return 'star';
      default:
        return 'chatbubbles';
    }
  };

  const renderBoard = ({ item }: { item: Board }) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => navigation.navigate('BoardDetail', { board: item })}
    >
      <View style={styles.boardHeader}>
        <Icon
          name={getBoardIcon(item.board_type)}
          size={24}
          color={COLORS.primary}
          style={styles.boardIcon}
        />
        <View style={styles.boardInfo}>
          <Text style={styles.boardName}>{item.name}</Text>
          <Text style={styles.boardDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.boardStats}>
        <Text style={styles.boardPosts}>{item.total_posts} posts</Text>
        <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const filteredBoards = boards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
          placeholder="Search boards..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredBoards}
        renderItem={renderBoard}
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
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  list: {
    padding: SPACING.md,
  },
  boardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  boardIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  boardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  boardPosts: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
