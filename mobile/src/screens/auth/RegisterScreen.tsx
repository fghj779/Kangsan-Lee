import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';

const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authService.register({ email, username, password, full_name: fullName });
      Alert.alert('Success', 'Account created successfully! Please login.');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
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
        placeholder="Username"
        placeholderTextColor={theme.colors.textTertiary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
        placeholder="Full Name"
        placeholderTextColor={theme.colors.textTertiary}
        value={fullName}
        onChangeText={setFullName}
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
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
          {loading ? 'Creating Account...' : 'Register'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, marginTop: 24 },
  input: { padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1 },
  button: { padding: 16, borderRadius: 8, marginTop: 8, marginBottom: 32 },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default RegisterScreen;
