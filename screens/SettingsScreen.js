import React, { useState, useEffect } from 'react';
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
import { getWeeklyLimit, setWeeklyLimit } from '../utils/storage';

export default function SettingsScreen() {
  const [weeklyLimit, setWeeklyLimitInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyLimit();
  }, []);

  const loadWeeklyLimit = async () => {
    try {
      const limit = await getWeeklyLimit();
      setWeeklyLimitInput(limit.toString());
      setLoading(false);
    } catch (error) {
      console.error('Error loading weekly limit:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const limit = parseFloat(weeklyLimit);
    
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weekly limit greater than 0.');
      return;
    }

    try {
      await setWeeklyLimit(limit);
      Alert.alert('Success', 'Weekly limit updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save weekly limit. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your weekly spending limit</Text>
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.label}>Weekly Spending Limit</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            value={weeklyLimit}
            onChangeText={setWeeklyLimitInput}
          />
          <Text style={styles.helpText}>
            Your expenses will reset every Monday. This limit helps you track your weekly spending.
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, !weeklyLimit && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!weeklyLimit}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: 16,
    marginTop: 48,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});

