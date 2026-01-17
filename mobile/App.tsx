/**
 * Football Jersey Community - Mobile App
 * Main application entry point
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Jersey Community</Text>
      <Text style={styles.subtitle}>Mobile App with Comprehensive Error Handling</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>✅ API Service with error handling</Text>
        <Text style={styles.infoText}>✅ Authentication service with validation</Text>
        <Text style={styles.infoText}>✅ User-friendly error messages</Text>
        <Text style={styles.infoText}>✅ Network error detection</Text>
        <Text style={styles.infoText}>✅ Token refresh mechanism</Text>
        <Text style={styles.infoText}>✅ Input validation</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
});
