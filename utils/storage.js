import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEKLY_LIMIT_KEY = 'weeklyLimit';
const EXPENSES_KEY = 'expenses';
const LAST_RESET_KEY = 'lastReset';

// Get the start of the current week (Monday)
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Get the end of the current week (Sunday)
export const getWeekEnd = (date = new Date()) => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

// Format date range for display
export const formatWeekRange = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${startStr} - ${endStr}`;
};

// Check if we need to reset (new week started)
export const checkAndResetWeek = async () => {
  try {
    const lastResetStr = await AsyncStorage.getItem(LAST_RESET_KEY);
    const currentWeekStart = getWeekStart();
    
    if (!lastResetStr) {
      // First time, set the reset date
      await AsyncStorage.setItem(LAST_RESET_KEY, currentWeekStart.toISOString());
      return false;
    }
    
    const lastReset = new Date(lastResetStr);
    const lastResetWeekStart = getWeekStart(lastReset);
    
    // If current week is different from last reset week, reset expenses
    if (currentWeekStart.getTime() !== lastResetWeekStart.getTime()) {
      await AsyncStorage.setItem(LAST_RESET_KEY, currentWeekStart.toISOString());
      // Archive current week's expenses before resetting
      await archiveCurrentWeek();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking/resetting week:', error);
    return false;
  }
};

// Archive current week's expenses
const archiveCurrentWeek = async () => {
  try {
    const expenses = await getExpenses();
    if (expenses.length === 0) return;
    
    const weekStart = getWeekStart();
    const archivedWeeks = await getArchivedWeeks();
    
    // Add current week to archived weeks
    archivedWeeks.push({
      weekStart: weekStart.toISOString(),
      expenses: expenses,
      total: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    });
    
    await AsyncStorage.setItem('archivedWeeks', JSON.stringify(archivedWeeks));
    
    // Clear current expenses
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error archiving week:', error);
  }
};

// Get weekly limit
export const getWeeklyLimit = async () => {
  try {
    const limit = await AsyncStorage.getItem(WEEKLY_LIMIT_KEY);
    return limit ? parseFloat(limit) : 0;
  } catch (error) {
    console.error('Error getting weekly limit:', error);
    return 0;
  }
};

// Set weekly limit
export const setWeeklyLimit = async (limit) => {
  try {
    await AsyncStorage.setItem(WEEKLY_LIMIT_KEY, limit.toString());
  } catch (error) {
    console.error('Error setting weekly limit:', error);
  }
};

// Get current week expenses
export const getExpenses = async () => {
  try {
    await checkAndResetWeek();
    const expenses = await AsyncStorage.getItem(EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

// Add expense
export const addExpense = async (expense) => {
  try {
    await checkAndResetWeek();
    const expenses = await getExpenses();
    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(expense.amount),
      category: expense.category,
      description: expense.description || '',
      date: new Date().toISOString()
    };
    expenses.push(newExpense);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return newExpense;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  try {
    const expenses = await getExpenses();
    const filtered = expenses.filter(exp => exp.id !== expenseId);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Get archived weeks
export const getArchivedWeeks = async () => {
  try {
    const archived = await AsyncStorage.getItem('archivedWeeks');
    return archived ? JSON.parse(archived) : [];
  } catch (error) {
    console.error('Error getting archived weeks:', error);
    return [];
  }
};

// Get all weeks (current + archived)
export const getAllWeeks = async () => {
  try {
    await checkAndResetWeek();
    const currentExpenses = await getExpenses();
    const archivedWeeks = await getArchivedWeeks();
    const currentWeekStart = getWeekStart();
    
    const weeks = [];
    
    // Add current week
    if (currentExpenses.length > 0 || archivedWeeks.length === 0) {
      weeks.push({
        weekStart: currentWeekStart.toISOString(),
        expenses: currentExpenses,
        total: currentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
        isCurrent: true
      });
    }
    
    // Add archived weeks
    archivedWeeks.forEach(week => {
      weeks.push({
        ...week,
        isCurrent: false
      });
    });
    
    // Sort by week start (newest first)
    weeks.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
    
    return weeks;
  } catch (error) {
    console.error('Error getting all weeks:', error);
    return [];
  }
};

