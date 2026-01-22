/**
 * Board List Screen - Shows all community boards
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { CommunityStackParamList } from '../../navigation/types';
import apiService from '../../services/api';

type NavigationProp = StackNavigationProp<CommunityStackParamList, 'BoardList'>;

interface Board {
  id: number;
  name: string;
  description: string;
  board_type: string;
  club_name?: string;
  total_posts: number;
  total_members: number;
}

const BoardListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/boards');
      setBoards(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const renderBoard = ({ item }: { item: Board }) => (
    <TouchableOpacity
      style={[styles.boardCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('BoardDetail', { boardId: item.id, boardName: item.name })}
    >
      <View style={styles.boardHeader}>
        <Text style={[styles.boardName, { color: theme.colors.text }]}>{item.name}</Text>
        {item.club_name && (
          <Text style={[styles.clubName, { color: theme.colors.primary }]}>{item.club_name}</Text>
        )}
      </View>
      <Text style={[styles.boardDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.boardStats}>
        <Text style={[styles.stat, { color: theme.colors.textTertiary }]}>
          {item.total_posts} posts
        </Text>
        <Text style={[styles.stat, { color: theme.colors.textTertiary }]}>
          {item.total_members} members
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={loadBoards}>
          <Text style={[styles.retryText, { color: theme.colors.textInverse }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={boards}
        renderItem={renderBoard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadBoards}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  boardCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boardName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
  },
  boardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  boardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoardListScreen;
