import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl
} from 'react-native';
import { getAllWeeks, formatWeekRange } from '../utils/storage';

export default function OverviewScreen({ navigation }) {
  const [weeks, setWeeks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWeeks();
    const unsubscribe = navigation.addListener('focus', loadWeeks);
    return unsubscribe;
  }, [navigation]);

  const loadWeeks = async () => {
    const allWeeks = await getAllWeeks();
    setWeeks(allWeeks);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeeks();
    setRefreshing(false);
  };

  const handleWeekPress = (week) => {
    navigation.navigate('WeekDetail', { week });
  };

  const renderWeekItem = ({ item }) => {
    const weekStart = new Date(item.weekStart);
    const weekRange = formatWeekRange(weekStart);
    const expenseCount = item.expenses.length;

    return (
      <TouchableOpacity
        style={styles.weekItem}
        onPress={() => handleWeekPress(item)}
      >
        <View style={styles.weekHeader}>
          <View style={styles.weekInfo}>
            <Text style={styles.weekRange}>{weekRange}</Text>
            {item.isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          <Text style={styles.weekTotal}>${item.total.toFixed(2)}</Text>
        </View>
        <Text style={styles.weekExpenseCount}>
          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Overview</Text>
        <Text style={styles.subtitle}>Tap a week to view details</Text>
      </View>

      {weeks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No weeks tracked yet</Text>
          <Text style={styles.emptySubtext}>
            Start adding expenses to see your weekly overview
          </Text>
        </View>
      ) : (
        <FlatList
          data={weeks}
          keyExtractor={(item, index) => item.weekStart || index.toString()}
          renderItem={renderWeekItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  listContainer: {
    padding: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  weekItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  weekInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  weekTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  weekExpenseCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

