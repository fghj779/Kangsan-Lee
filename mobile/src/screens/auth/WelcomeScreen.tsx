import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Football Jersey Community</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Collect, Trade, and Connect with Fellow Fans
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.buttonSecondary, { borderColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={[styles.buttonSecondaryText, { color: theme.colors.primary }]}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 48, textAlign: 'center' },
  button: { width: '100%', padding: 16, borderRadius: 8, marginBottom: 12 },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  buttonSecondary: { width: '100%', padding: 16, borderRadius: 8, borderWidth: 2 },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default WelcomeScreen;
