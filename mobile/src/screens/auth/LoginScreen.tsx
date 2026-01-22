import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';

const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.login({ email, password });
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Login</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textTertiary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Password"
        placeholderTextColor={theme.colors.textTertiary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32 },
  input: { padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1 },
  button: { padding: 16, borderRadius: 8, marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default LoginScreen;
