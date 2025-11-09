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
  
  // Sort categories by amount (descending) for better visualization
  const sortedCategories = categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  
  const pieData = sortedCategories.map((category, index) => ({
    name: category,
    amount: categoryTotals[category],
    color: colors[index % colors.length],
    // Remove legend properties - we'll create a custom legend
  }));
  
  // Prepare legend data with percentages
  const legendData = sortedCategories.map((category, index) => ({
    name: category,
    amount: categoryTotals[category],
    color: colors[index % colors.length],
    percentage: total > 0 ? ((categoryTotals[category] / total) * 100).toFixed(1) : 0,
  }));

  // Group legend items into rows (colspan-like approach)
  // Calculate items per row based on screen width
  const containerPadding = 40; // 20px padding on each side
  const itemWidth = 140; // Approximate width per item including margins
  const itemsPerRow = Math.floor((screenWidth - containerPadding) / itemWidth) || 1;
  
  // Group items into rows
  const legendRows = [];
  for (let i = 0; i < legendData.length; i += itemsPerRow) {
    legendRows.push(legendData.slice(i, i + itemsPerRow));
  }

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
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="80"
              absolute
              hasLegend={false}
            />
          </View>
          
          {/* Custom Legend */}
          <View style={styles.legendContainer}>
            {legendRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.legendRow}>
                {row.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendCategory}>{item.name}</Text>
                      <Text style={styles.legendAmount}>
                        ${item.amount.toFixed(2)} ({item.percentage}%)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
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
            renderItem={({ item, index }) => {
              const isLastItem = index === sortedExpenses.length - 1;
              return (
                <View style={[styles.expenseItem, isLastItem && styles.expenseItemLast]}>
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
              );
            }}
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  legendContainer: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    width: 140,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flexShrink: 1,
  },
  legendCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  legendAmount: {
    fontSize: 12,
    color: '#666',
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
  expenseItemLast: {
    borderBottomWidth: 0,
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

