import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { formatWeekRange, getWeeklyLimit } from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

export default function WeekDetailScreen({ route }) {
  const { week } = route.params;
  const [weeklyLimit, setWeeklyLimit] = useState(0);

  useEffect(() => {
    loadWeeklyLimit();
  }, []);

  const loadWeeklyLimit = async () => {
    const limit = await getWeeklyLimit();
    setWeeklyLimit(limit);
  };

  const weekStart = new Date(week.weekStart);
  const weekRange = formatWeekRange(weekStart);
  const total = week.total;

  // Calculate expenses by category
  const categoryTotals = {};
  week.expenses.forEach(expense => {
    const category = expense.category;
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += parseFloat(expense.amount);
  });

  // Prepare data for pie chart
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'
  ];
  const categories = Object.keys(categoryTotals);
  const pieData = categories.map((category, index) => ({
    name: category,
    amount: categoryTotals[category],
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Sort expenses by date (newest first)
  const sortedExpenses = [...week.expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.weekRange}>{weekRange}</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent:</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          {weeklyLimit > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Weekly Limit:</Text>
              <Text style={styles.summaryValue}>${weeklyLimit.toFixed(2)}</Text>
            </View>
          )}
          {weeklyLimit > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining:</Text>
              <Text style={[styles.summaryValue, { color: (weeklyLimit - total) < 0 ? '#FF3B30' : '#34C759' }]}>
                ${(weeklyLimit - total).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {pieData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <View style={styles.expensesContainer}>
        <Text style={styles.sectionTitle}>
          Expenses ({sortedExpenses.length})
        </Text>
        {sortedExpenses.length === 0 ? (
          <Text style={styles.emptyText}>No expenses for this week</Text>
        ) : (
          <FlatList
            data={sortedExpenses}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseCategory}>{item.category}</Text>
                  {item.description ? (
                    <Text style={styles.expenseDescription}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.expenseDate}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>
                  ${parseFloat(item.amount).toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  weekRange: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  expensesContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

