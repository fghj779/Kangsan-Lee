/**
 * Create post screen - placeholder
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

export default function CreatePostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Post Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: COLORS.text },
});
