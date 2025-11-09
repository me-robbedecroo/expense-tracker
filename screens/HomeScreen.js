import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { addExpense, getExpenses, deleteExpense, getWeeklyLimit, getWeekStart, getWeekEnd, formatWeekRange, parseDecimal, getIncome, addIncome, deleteIncome } from '../utils/storage';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Other'
];

export default function HomeScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [weeklyLimit, setWeeklyLimit] = useState(0);
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const exp = await getExpenses();
    const inc = await getIncome();
    const limit = await getWeeklyLimit();
    const weekStart = getWeekStart();
    setExpenses(exp);
    setIncome(inc);
    setWeeklyLimit(limit);
    setWeekRange(formatWeekRange(weekStart));
  };

  const handleAddExpense = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Missing Information', 'Please enter an amount and select a category.');
      return;
    }

    const amountNum = parseDecimal(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    try {
      await addExpense({
        amount: amountNum,
        category: selectedCategory,
        description: description.trim()
      });
      
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      await loadData();
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
  };

  const handleAddIncome = async () => {
    if (!incomeAmount) {
      Alert.alert('Missing Information', 'Please enter an income amount.');
      return;
    }

    const amountNum = parseDecimal(incomeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    try {
      await addIncome(amountNum);
      setIncomeAmount('');
      await loadData();
      Alert.alert('Success', 'Income added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add income. Please try again.');
    }
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expenseId);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteIncome = (incomeId) => {
    Alert.alert(
      'Delete Income',
      'Are you sure you want to delete this income?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncome(incomeId);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete income.');
            }
          }
        }
      ]
    );
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const actualRemaining = weeklyLimit - totalSpent + totalIncome;
  const remaining = actualRemaining < 0 ? 0 : actualRemaining;
  const percentage = weeklyLimit > 0 ? (totalSpent / weeklyLimit) * 100 : 0;

  // Combine expenses and income into transactions, sorted by date (newest first)
  const transactions = [
    ...expenses.map(exp => ({ ...exp, type: 'expense' })),
    ...income.map(inc => ({ ...inc, type: 'income' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={styles.weekRange}>{weekRange}</Text>
        <View style={styles.budgetContainer}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Weekly Limit:</Text>
            <Text style={styles.budgetValue}>${weeklyLimit.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Spent:</Text>
            <Text style={[styles.budgetValue, { color: percentage > 100 ? '#FF3B30' : '#34C759' }]}>
              ${totalSpent.toFixed(2)}
            </Text>
          </View>
          {totalIncome > 0 && (
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Income:</Text>
              <Text style={[styles.budgetValue, { color: '#34C759' }]}>
                +${totalIncome.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Remaining:</Text>
            <Text style={[styles.budgetValue, { color: remaining === 0 ? '#FF3B30' : '#333' }]}>
              ${remaining.toFixed(2)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: percentage > 100 ? '#FF3B30' : '#34C759'
                }
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Add Expense</Text>
        
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you spend on?"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextSelected
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, (!amount || !selectedCategory) && styles.addButtonDisabled]}
          onPress={handleAddExpense}
          disabled={!amount || !selectedCategory}
        >
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.incomeContainer}>
        <Text style={styles.incomeTitle}>Quick Add Income</Text>
        <View style={styles.incomeInputRow}>
          <TextInput
            style={styles.incomeInput}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={incomeAmount}
            onChangeText={setIncomeAmount}
          />
          <TouchableOpacity
            style={[styles.incomeButton, !incomeAmount && styles.incomeButtonDisabled]}
            onPress={handleAddIncome}
            disabled={!incomeAmount}
          >
            <Text style={styles.incomeButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.expensesContainer}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet this week</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              const isLastItem = index === transactions.length - 1;
              const isIncome = item.type === 'income';
              return (
                <View style={[styles.expenseItem, isLastItem && styles.expenseItemLast]}>
                  <View style={styles.expenseInfo}>
                    {isIncome ? (
                      <Text style={styles.expenseCategory}>Income</Text>
                    ) : (
                      <Text style={styles.expenseCategory}>{item.category}</Text>
                    )}
                    {!isIncome && item.description ? (
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
                  <View style={styles.expenseAmountContainer}>
                    <Text style={[styles.expenseAmount, isIncome && styles.incomeAmount]}>
                      {isIncome ? '+' : ''}${parseFloat(item.amount).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => isIncome ? handleDeleteIncome(item.id) : handleDeleteExpense(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
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
    marginTop: 48,
    borderRadius: 12,
  },
  weekRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  budgetContainer: {
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
    color: '#666',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  formContainer: {
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
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  incomeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  incomeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  incomeButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  incomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  expenseAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  incomeAmount: {
    color: '#34C759',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

