import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.surface }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
          Theme: {themeMode === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  button: { padding: 16, borderRadius: 8, marginBottom: 12 },
  buttonText: { fontSize: 16 },
});

export default SettingsScreen;
