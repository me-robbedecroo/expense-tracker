import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { setWeeklyLimit, parseDecimal } from '../utils/storage';

export default function OnboardingScreen({ onComplete }) {
  const [weeklyLimit, setWeeklyLimitInput] = useState('');

  const handleContinue = async () => {
    const limit = parseDecimal(weeklyLimit);
    
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weekly limit greater than 0.');
      return;
    }

    try {
      await setWeeklyLimit(limit);
      // Notify parent component to update navigation
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save weekly limit. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Money Tracker</Text>
        <Text style={styles.subtitle}>
          Track your weekly expenses and stay within your budget
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Set your weekly spending limit</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={weeklyLimit}
            onChangeText={setWeeklyLimitInput}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !weeklyLimit && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!weeklyLimit}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    marginHorizontal: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

