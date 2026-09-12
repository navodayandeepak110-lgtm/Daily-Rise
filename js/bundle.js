/**
 * Standalone Bundled Script for Direct file:// execution and HTTP
 */
(function() {
﻿/**
 * storage.js - LocalStorage management for Habit Tracker
 */

const STORAGE_KEY = 'habit_tracker_data_v1';

const DEFAULT_HABITS = [
  { id: 'h-1', name: 'Review class notes', description: 'Review summary notes taken during class', color: '#6ea8fe', position: 1, createdAt: new Date().toISOString() },
  { id: 'h-2', name: 'Complete assignments', description: 'Finish pending course assignments & homework', color: '#6ea8fe', position: 2, createdAt: new Date().toISOString() },
  { id: 'h-3', name: 'Organize study area', description: 'Clean desk and prepare study materials', color: '#6ea8fe', position: 3, createdAt: new Date().toISOString() },
  { id: 'h-4', name: 'Read 10 pages of a book', description: 'Read non-fiction or educational book', color: '#f06292', position: 4, createdAt: new Date().toISOString() },
  { id: 'h-5', name: 'Exercise for 30 minutes', description: 'Cardio, strength, or yoga workout', color: '#f06292', position: 5, createdAt: new Date().toISOString() },
  { id: 'h-6', name: 'Drink 8 glasses of water', description: 'Stay well-hydrated throughout the day', color: '#4dd0e1', position: 6, createdAt: new Date().toISOString() },
  { id: 'h-7', name: 'Plan next day\'s schedule', description: 'Draft top 3 priorities for tomorrow', color: '#4dd0e1', position: 7, createdAt: new Date().toISOString() },
  { id: 'h-8', name: 'Meditate for 10 minutes', description: 'Mindful breathing and focus relaxation', color: '#f6bd60', position: 8, createdAt: new Date().toISOString() },
  { id: 'h-9', name: 'Check emails and updates', description: 'Clear inbox and check announcements', color: '#f6bd60', position: 9, createdAt: new Date().toISOString() },
  { id: 'h-10', name: 'Practice language skills', description: 'Vocabulary review or language app lesson', color: '#90caf9', position: 10, createdAt: new Date().toISOString() },
  { id: 'h-11', name: 'Review flashcards', description: 'Spaced repetition flashcard session', color: '#90caf9', position: 11, createdAt: new Date().toISOString() },
  { id: 'h-12', name: 'Write in a journal', description: 'Evening reflection and gratitude journal', color: '#ba68c8', position: 12, createdAt: new Date().toISOString() },
  { id: 'h-13', name: 'Solve 5 practice problems', description: 'Coding or math challenges', color: '#ba68c8', position: 13, createdAt: new Date().toISOString() },
  { id: 'h-14', name: 'Connect with a classmate', description: 'Study group discussion or check-in', color: '#4db6ac', position: 14, createdAt: new Date().toISOString() }
];

const DEFAULT_SETTINGS = {
  motivationalText: "Focused, intentional, and ready for the month ahead.",
  motivationalAuthor: "I am...",
  firstDayOfWeek: "monday", // 'monday' or 'sunday'
  theme: "pastel-light"
};

class StorageManager {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.habits)) {
          parsed.habits = parsed.habits.sort((a, b) => (a.position || 0) - (b.position || 0));
          parsed.completions = parsed.completions || {};
          parsed.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage, initializing default state:', e);
    }

    const initialData = {
      habits: DEFAULT_HABITS.map(h => ({ ...h })),
      completions: {},
      settings: { ...DEFAULT_SETTINGS }
    };
    this.saveData(initialData);
    return initialData;
  }

  saveData(data = this.data) {
    this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      return false;
    }
  }

  getHabits() {
    return this.data.habits || [];
  }

  getCompletions() {
    return this.data.completions || {};
  }

  getSettings() {
    return this.data.settings || { ...DEFAULT_SETTINGS };
  }

  addHabit(habitData) {
    const newId = 'h-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const maxPosition = this.data.habits.reduce((max, h) => Math.max(max, h.position || 0), 0);
    const newHabit = {
      id: newId,
      name: habitData.name.trim(),
      description: (habitData.description || '').trim(),
      color: habitData.color || '#6ea8fe',
      position: maxPosition + 1,
      createdAt: new Date().toISOString()
    };
    this.data.habits.push(newHabit);
    this.saveData();
    return newHabit;
  }

  updateHabit(id, updatedFields) {
    const habit = this.data.habits.find(h => h.id === id);
    if (!habit) return null;
    if (updatedFields.name !== undefined) habit.name = updatedFields.name.trim();
    if (updatedFields.description !== undefined) habit.description = (updatedFields.description || '').trim();
    if (updatedFields.color !== undefined) habit.color = updatedFields.color;
    if (updatedFields.position !== undefined) habit.position = updatedFields.position;
    this.saveData();
    return habit;
  }

  deleteHabit(id) {
    this.data.habits = this.data.habits.filter(h => h.id !== id);
    for (const dateKey in this.data.completions) {
      if (this.data.completions[dateKey][id] !== undefined) {
        delete this.data.completions[dateKey][id];
      }
    }
    this.data.habits.forEach((h, idx) => {
      h.position = idx + 1;
    });
    this.saveData();
  }

  reorderHabits(orderedIds) {
    const habitMap = new Map(this.data.habits.map(h => [h.id, h]));
    const newHabits = [];
    orderedIds.forEach((id, idx) => {
      if (habitMap.has(id)) {
        const habit = habitMap.get(id);
        habit.position = idx + 1;
        newHabits.push(habit);
        habitMap.delete(id);
      }
    });
    habitMap.forEach((habit) => {
      habit.position = newHabits.length + 1;
      newHabits.push(habit);
    });
    this.data.habits = newHabits;
    this.saveData();
  }

  toggleCompletion(dateKey, habitId) {
    if (!this.data.completions[dateKey]) {
      this.data.completions[dateKey] = {};
    }
    const currentStatus = !!this.data.completions[dateKey][habitId];
    const newStatus = !currentStatus;
    if (newStatus) {
      this.data.completions[dateKey][habitId] = true;
    } else {
      delete this.data.completions[dateKey][habitId];
      if (Object.keys(this.data.completions[dateKey]).length === 0) {
        delete this.data.completions[dateKey];
      }
    }
    this.saveData();
    return newStatus;
  }

  isCompleted(dateKey, habitId) {
    return !!(this.data.completions[dateKey] && this.data.completions[dateKey][habitId]);
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  resetCurrentMonth(year, month) {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    for (const key of Object.keys(this.data.completions)) {
      if (key.startsWith(prefix)) {
        delete this.data.completions[key];
      }
    }
    this.saveData();
  }

  resetAllData() {
    this.data = {
      habits: DEFAULT_HABITS.map(h => ({ ...h })),
      completions: {},
      settings: { ...DEFAULT_SETTINGS }
    };
    this.saveData();
  }

  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.habits)) {
        throw new Error('Invalid JSON format: missing habits array');
      }
      parsed.habits.forEach((h, idx) => {
        if (!h.id || !h.name) {
          h.id = h.id || 'h-' + idx;
          h.name = h.name || 'Habit ' + (idx + 1);
        }
        h.position = idx + 1;
      });
      parsed.completions = parsed.completions || {};
      parsed.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
      this.data = parsed;
      this.saveData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  loadDemoData(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    this.data.habits.forEach((habit, hIdx) => {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${prefix}-${String(d).padStart(2, '0')}`;
        if (!this.data.completions[dateKey]) {
          this.data.completions[dateKey] = {};
        }
        
        let prob = 0.65;
        if (d <= 7) prob = 0.52 + ((hIdx * 7 + d) % 4) * 0.12;
        else if (d <= 14) prob = 0.58 + ((hIdx * 3 + d) % 3) * 0.14;
        else if (d <= 21) prob = 0.60 - ((hIdx * 2 + d) % 4) * 0.08;
        else if (d <= 24) prob = 0.22 + ((hIdx + d) % 2) * 0.18;
        else prob = 0.0; // Rest of month future/empty

        if (Math.random() < prob) {
          this.data.completions[dateKey][habit.id] = true;
        } else {
          delete this.data.completions[dateKey][habit.id];
        }
      }
    });

    this.saveData();
  }
}


﻿/**
 * calendar.js - Calendar and Date calculations
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LETTERS_MON = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Monday first: Mon=0 .. Sun=6
const DAY_LETTERS_SUN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday first: Sun=0 .. Sat=6

const DAY_FULL_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

class CalendarService {
  constructor(initialYear = new Date().getFullYear(), initialMonth = new Date().getMonth()) {
    this.currentYear = initialYear;
    this.currentMonth = initialMonth; // 0-indexed (0 = Jan, 11 = Dec)
  }

  setMonth(monthIndex) {
    this.currentMonth = Math.max(0, Math.min(11, parseInt(monthIndex, 10)));
  }

  setYear(year) {
    this.currentYear = parseInt(year, 10);
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
  }

  goToToday() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
  }

  getMonthName(monthIndex = this.currentMonth) {
    return MONTH_NAMES[monthIndex];
  }

  getDaysInMonth(year = this.currentYear, month = this.currentMonth) {
    // 0th day of next month returns the last day of current month
    return new Date(year, month + 1, 0).getDate();
  }

  formatDateKey(year, month, day) {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Returns information for all days in the current month,
   * grouped into weeks matching the reference layout (7 days per standard week block,
   * with exact weekday letters corresponding to the calendar).
   */
  getMonthData(firstDayOfWeek = 'monday') {
    const totalDays = this.getDaysInMonth();
    const today = new Date();
    const todayKey = this.formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, d);
      const dayOfWeekIdx = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dateKey = this.formatDateKey(this.currentYear, this.currentMonth, d);

      // Letter representation based on day of week
      let letter = '';
      if (dayOfWeekIdx === 0) letter = 'S';
      else if (dayOfWeekIdx === 1) letter = 'M';
      else if (dayOfWeekIdx === 2) letter = 'T';
      else if (dayOfWeekIdx === 3) letter = 'W';
      else if (dayOfWeekIdx === 4) letter = 'T';
      else if (dayOfWeekIdx === 5) letter = 'F';
      else if (dayOfWeekIdx === 6) letter = 'S';

      const isToday = (dateKey === todayKey);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isFuture = dateObj > new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Standard week grouping (7 days per block as in the reference tracker)
      const weekIndex = Math.floor((d - 1) / 7);

      days.push({
        day: d,
        dateKey,
        dayOfWeekIdx,
        dayLetter: letter,
        dayFullName: DAY_FULL_NAMES[dayOfWeekIdx],
        weekIndex,
        isToday,
        isPast,
        isFuture,
        isWeekend: (dayOfWeekIdx === 0 || dayOfWeekIdx === 6)
      });
    }

    // Group into weeks
    const weeks = [];
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let w = 0; w < totalWeeks; w++) {
      const weekDays = days.filter(d => d.weekIndex === w);
      weeks.push({
        weekNumber: w + 1,
        weekName: `Week ${w + 1}`,
        days: weekDays,
        startDay: weekDays[0].day,
        endDay: weekDays[weekDays.length - 1].day
      });
    }

    return {
      year: this.currentYear,
      month: this.currentMonth,
      monthName: this.getMonthName(),
      totalDays,
      days,
      weeks
    };
  }
}


﻿/**
 * statistics.js - Analytics, progress, and streak calculations
 */

class StatisticsService {
  /**
   * Calculate all stats for a given month's data, habits, and completions
   */
  static calculateMonthStats(monthData, habits, completions) {
    const totalHabits = habits.length;
    const totalDays = monthData.totalDays;

    if (totalHabits === 0 || totalDays === 0) {
      return {
        dailyPercentages: monthData.days.map(() => 0),
        weeklyStats: monthData.weeks.map(w => ({ weekNumber: w.weekNumber, percentage: 0, completed: 0, possible: 0 })),
        monthlyPercentage: 0,
        completedCheckins: 0,
        possibleCheckins: 0,
        bestDay: { day: null, percentage: 0, dateKey: '' },
        bestHabit: { name: 'None', completedCount: 0, percentage: 0 },
        currentStreak: 0,
        longestStreak: 0,
        habitStats: []
      };
    }

    const possibleCheckins = totalHabits * totalDays;
    let totalCompletedCheckins = 0;

    // Daily calculations
    const dailyPercentages = [];
    const dailyCompletedCounts = [];
    let bestDayObj = { day: null, percentage: -1, dateKey: '' };

    monthData.days.forEach(d => {
      const dayCompletions = completions[d.dateKey] || {};
      let completedCount = 0;
      habits.forEach(h => {
        if (dayCompletions[h.id]) {
          completedCount++;
        }
      });
      totalCompletedCheckins += completedCount;
      const pct = (completedCount / totalHabits) * 100;
      dailyPercentages.push(Math.round(pct));
      dailyCompletedCounts.push(completedCount);

      if (pct > bestDayObj.percentage && completedCount > 0) {
        bestDayObj = {
          day: d.day,
          percentage: Math.round(pct),
          dateKey: d.dateKey,
          dayFullName: d.dayFullName
        };
      }
    });

    if (bestDayObj.percentage === -1) {
      bestDayObj = { day: '-', percentage: 0, dateKey: '', dayFullName: '-' };
    }

    // Weekly calculations
    const weeklyStats = monthData.weeks.map(w => {
      const daysCount = w.days.length;
      const weekPossible = totalHabits * daysCount;
      let weekCompleted = 0;

      w.days.forEach(d => {
        const dayCompletions = completions[d.dateKey] || {};
        habits.forEach(h => {
          if (dayCompletions[h.id]) {
            weekCompleted++;
          }
        });
      });

      const pct = weekPossible > 0 ? (weekCompleted / weekPossible) * 100 : 0;
      return {
        weekNumber: w.weekNumber,
        weekName: w.weekName,
        completed: weekCompleted,
        possible: weekPossible,
        percentage: parseFloat(pct.toFixed(1))
      };
    });

    // Monthly percentage
    const monthlyPercentage = possibleCheckins > 0
      ? parseFloat(((totalCompletedCheckins / possibleCheckins) * 100).toFixed(1))
      : 0;

    // Habit individual stats & best habit
    const habitStats = habits.map(h => {
      let completedCount = 0;
      monthData.days.forEach(d => {
        if (completions[d.dateKey] && completions[d.dateKey][h.id]) {
          completedCount++;
        }
      });
      const pct = (completedCount / totalDays) * 100;
      const streak = this.calculateHabitStreak(h.id, monthData, completions);
      return {
        id: h.id,
        name: h.name,
        color: h.color,
        completedCount,
        percentage: parseFloat(pct.toFixed(1)),
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak
      };
    });

    let bestHabit = { name: 'None', completedCount: 0, percentage: 0 };
    if (habitStats.length > 0) {
      const sorted = [...habitStats].sort((a, b) => b.completedCount - a.completedCount);
      if (sorted[0].completedCount > 0) {
        bestHabit = sorted[0];
      }
    }

    // Global Streaks (days with at least 1 completed habit)
    const globalStreak = this.calculateGlobalStreak(monthData, dailyCompletedCounts);

    return {
      dailyPercentages,
      weeklyStats,
      monthlyPercentage,
      completedCheckins: totalCompletedCheckins,
      possibleCheckins,
      bestDay: bestDayObj,
      bestHabit,
      currentStreak: globalStreak.currentStreak,
      longestStreak: globalStreak.longestStreak,
      habitStats
    };
  }

  /**
   * Calculate streak for a specific habit up to today or end of days
   */
  static calculateHabitStreak(habitId, monthData, completions) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let longestStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;

    const days = monthData.days;
    // Find index of today or end of past days
    let activeLimitIdx = days.length - 1;
    for (let i = 0; i < days.length; i++) {
      if (days[i].isFuture) {
        activeLimitIdx = i - 1;
        break;
      }
    }
    if (activeLimitIdx < 0) activeLimitIdx = 0;

    // Calculate longest streak in the sequence
    for (let i = 0; i <= activeLimitIdx; i++) {
      const d = days[i];
      const done = !!(completions[d.dateKey] && completions[d.dateKey][habitId]);
      if (done) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak backwards from today (or last past day)
    let backIdx = activeLimitIdx;
    while (backIdx >= 0) {
      const d = days[backIdx];
      const done = !!(completions[d.dateKey] && completions[d.dateKey][habitId]);
      if (done) {
        currentStreak++;
        backIdx--;
      } else {
        // If today is unchecked, allow looking from yesterday
        if (backIdx === activeLimitIdx && days[backIdx].isToday && currentStreak === 0) {
          backIdx--;
          continue;
        }
        break;
      }
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate overall daily activity streak
   */
  static calculateGlobalStreak(monthData, dailyCompletedCounts) {
    let longestStreak = 0;
    let tempStreak = 0;
    let currentStreak = 0;

    const days = monthData.days;
    let activeLimitIdx = days.length - 1;
    for (let i = 0; i < days.length; i++) {
      if (days[i].isFuture) {
        activeLimitIdx = i - 1;
        break;
      }
    }
    if (activeLimitIdx < 0) activeLimitIdx = 0;

    for (let i = 0; i <= activeLimitIdx; i++) {
      if (dailyCompletedCounts[i] > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    let backIdx = activeLimitIdx;
    while (backIdx >= 0) {
      if (dailyCompletedCounts[backIdx] > 0) {
        currentStreak++;
        backIdx--;
      } else {
        if (backIdx === activeLimitIdx && days[backIdx].isToday && currentStreak === 0) {
          backIdx--;
          continue;
        }
        break;
      }
    }

    return { currentStreak, longestStreak };
  }
}


﻿/**
 * charts.js - Top Trend Area Chart & Weekly Analytics Visualization
 */

class ChartService {
  constructor() {
    this.trendChartInstance = null;
  }

  /**
   * Color mapping for each week index (0 to 5) with high contrast
   */
  static getWeekColor(weekIndex) {
    const colors = [
      { primary: '#2563EB', light: '#DBEAFE', border: '#1D4ED8' }, // Week 1 Rich Blue
      { primary: '#DB2777', light: '#FCE7F3', border: '#BE185D' }, // Week 2 Rich Pink/Rose
      { primary: '#0D9488', light: '#CCFBF1', border: '#0F766E' }, // Week 3 Deep Teal
      { primary: '#D97706', light: '#FEF3C7', border: '#B45309' }, // Week 4 Amber Gold
      { primary: '#4F46E5', light: '#E0E7FF', border: '#3730A3' }, // Week 5 Indigo / Steel Blue
      { primary: '#9333EA', light: '#F3E8FF', border: '#7E22CE' }  // Week 6 Vivid Purple
    ];
    return colors[weekIndex % colors.length];
  }

  /**
   * Renders the top decorative/data-driven monthly trend chart
   */
  renderTrendChart(canvasElement, monthData, stats) {
    if (!canvasElement) return;

    const labels = monthData.days.map(d => `Day ${d.day}`);
    const data = stats.dailyPercentages;

    // Destroy previous Chart.js instance if exists
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
      this.trendChartInstance = null;
    }

    if (window.Chart) {
      const ctx = canvasElement.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasElement.height || 120);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.55)');
      gradient.addColorStop(0.8, 'rgba(37, 99, 235, 0.2)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.03)');

      this.trendChartInstance = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor: '#1D4ED8',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#1D4ED8',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 600,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#FFFFFF',
              bodyColor: '#FFFFFF',
              padding: 10,
              cornerRadius: 6,
              callbacks: {
                title: (items) => `${monthData.monthName} ${items[0].label}`,
                label: (item) => `Completion: ${item.raw}%`
              }
            }
          },
          scales: {
            x: {
              display: false,
              grid: { display: false }
            },
            y: {
              display: false,
              min: 0,
              max: 100,
              grid: { display: false }
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          }
        }
      });
    } else {
      // Fallback custom Canvas drawing for offline mode without CDN
      this.drawCanvasTrendFallback(canvasElement, data);
    }
  }

  /**
   * Fallback pure Canvas drawing in case CDN is unreachable
   */
  drawCanvasTrendFallback(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 400;
    const height = 90;
    canvas.width = width * window.devicePixelRatio || 400;
    canvas.height = height * window.devicePixelRatio || 90;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);
    if (!data || data.length === 0) return;

    const step = width / (data.length - 1 || 1);
    ctx.beginPath();
    ctx.moveTo(0, height);

    // Build curve
    const points = data.map((val, idx) => ({
      x: idx * step,
      y: height - (val / 100) * (height - 15) - 5
    }));

    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    if (points.length > 1) {
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    if (points.length > 1) {
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    }
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /**
   * Renders the Weekly Analytics Section:
   * - Daily Bar Charts grouped by week with percentages & day numbers
   * - Circular Progress Rings for each week
   */
  renderWeeklyAnalytics(containerElement, monthData, stats) {
    if (!containerElement) return;

    let html = '<div class="weekly-analytics-grid">';

    monthData.weeks.forEach((week, wIdx) => {
      const weekColor = ChartService.getWeekColor(wIdx);
      const weekStat = stats.weeklyStats[wIdx] || { percentage: 0, completed: 0, possible: 0 };
      
      // Calculate SVG ring stroke
      const radius = 38;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (weekStat.percentage / 100) * circumference;

      html += `
        <div class="week-analytics-col week-${wIdx + 1}" style="--col-color: ${weekColor.primary}; --col-light: ${weekColor.light}; --col-border: ${weekColor.border};">
          <div class="week-header-title">week ${week.weekNumber}</div>
          
          <!-- Daily Bars Container -->
          <div class="week-bars-container">
      `;

      week.days.forEach(d => {
        const pct = stats.dailyPercentages[d.day - 1] || 0;
        const barHeight = Math.max(pct, 0); // 0% to 100%

        html += `
          <div class="day-bar-wrapper" title="${monthData.monthName} ${d.day} (${d.dayFullName}): ${pct}% completed">
            <span class="day-bar-pct">${pct}%</span>
            <div class="day-bar-track">
              <div class="day-bar-fill" style="height: ${barHeight}%; background-color: ${weekColor.primary};"></div>
            </div>
            <span class="day-bar-num ${d.isToday ? 'is-today' : ''}">${d.day}</span>
          </div>
        `;
      });

      html += `
          </div>
          
          <!-- Circular Progress Ring -->
          <div class="week-ring-wrapper">
            <div class="progress-ring-container">
              <svg class="progress-ring-svg" width="94" height="94" viewBox="0 0 94 94">
                <circle class="progress-ring-bg" stroke="${weekColor.light}" stroke-width="9" fill="transparent" r="${radius}" cx="47" cy="47" />
                <circle class="progress-ring-fg" stroke="${weekColor.primary}" stroke-width="9" stroke-linecap="round" fill="transparent" r="${radius}" cx="47" cy="47"
                  style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};" />
              </svg>
              <div class="progress-ring-text">
                <span class="progress-ring-val">${weekStat.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div class="progress-ring-label">Week ${week.weekNumber}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    containerElement.innerHTML = html;
  }
}


﻿/**
 * app.js - Main Application Controller
 */






class HabitTrackerApp {
  constructor() {
    this.storage = new StorageManager();
    const now = new Date();
    this.calendar = new CalendarService(now.getFullYear(), now.getMonth());
    this.chartService = new ChartService();

    this.currentEditingHabitId = null;
    this.pendingDeleteHabitId = null;
    this.draggedHabitId = null;

    this.initElements();
    this.initDropdowns();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Header & Navigation
    this.monthTitleEl = document.getElementById('monthTitle');
    this.monthSelectEl = document.getElementById('monthSelect');
    this.yearSelectEl = document.getElementById('yearSelect');
    this.btnPrevMonth = document.getElementById('btnPrevMonth');
    this.btnNextMonth = document.getElementById('btnNextMonth');
    this.btnToday = document.getElementById('btnToday');

    // Action buttons
    this.btnAddHabit = document.getElementById('btnAddHabit');
    this.btnSettings = document.getElementById('btnSettings');
    this.btnExport = document.getElementById('btnExport');
    this.btnImport = document.getElementById('btnImport');
    this.importFileInput = document.getElementById('importFileInput');
    this.btnDemoData = document.getElementById('btnDemoData');

    // Visual & Content sections
    this.trendChartCanvas = document.getElementById('trendChartCanvas');
    this.weeklyAnalyticsContainer = document.getElementById('weeklyAnalyticsContainer');
    this.habitGridTable = document.getElementById('habitGridTable');
    this.emptyStateEl = document.getElementById('emptyState');
    this.gridContainerEl = document.getElementById('gridContainer');

    // Motivational Card
    this.motivationalAuthorEl = document.getElementById('motivationalAuthor');
    this.motivationalTextEl = document.getElementById('motivationalText');

    // Monthly Stats
    this.statMonthlyPctEl = document.getElementById('statMonthlyPct');
    this.statCompletedCountEl = document.getElementById('statCompletedCount');
    this.statPossibleCountEl = document.getElementById('statPossibleCount');
    this.statBestDayEl = document.getElementById('statBestDay');
    this.statBestHabitEl = document.getElementById('statBestHabit');
    this.statCurrentStreakEl = document.getElementById('statCurrentStreak');
    this.statLongestStreakEl = document.getElementById('statLongestStreak');

    // Modals
    this.habitModal = document.getElementById('habitModal');
    this.habitModalTitle = document.getElementById('habitModalTitle');
    this.habitForm = document.getElementById('habitForm');
    this.habitNameInput = document.getElementById('habitNameInput');
    this.habitDescInput = document.getElementById('habitDescInput');
    this.habitColorInput = document.getElementById('habitColorInput');
    this.btnCancelHabit = document.getElementById('btnCancelHabit');

    this.deleteModal = document.getElementById('deleteModal');
    this.deleteHabitNameEl = document.getElementById('deleteHabitName');
    this.btnConfirmDelete = document.getElementById('btnConfirmDelete');
    this.btnCancelDelete = document.getElementById('btnCancelDelete');

    this.settingsModal = document.getElementById('settingsModal');
    this.settingsForm = document.getElementById('settingsForm');
    this.settingMotivText = document.getElementById('settingMotivText');
    this.settingMotivAuthor = document.getElementById('settingMotivAuthor');
    this.settingFirstDay = document.getElementById('settingFirstDay');
    this.btnCancelSettings = document.getElementById('btnCancelSettings');
    this.btnResetMonth = document.getElementById('btnResetMonth');
    this.btnResetAll = document.getElementById('btnResetAll');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  initDropdowns() {
    // Populate months
    this.monthSelectEl.innerHTML = '';
    MONTH_NAMES.forEach((name, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = name;
      this.monthSelectEl.appendChild(opt);
    });

    // Populate years (2020 to 2035)
    this.yearSelectEl.innerHTML = '';
    const currentYr = new Date().getFullYear();
    for (let y = currentYr - 5; y <= currentYr + 10; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      this.yearSelectEl.appendChild(opt);
    }

    this.updateDropdownSelections();
  }

  updateDropdownSelections() {
    this.monthSelectEl.value = this.calendar.currentMonth;
    this.yearSelectEl.value = this.calendar.currentYear;
    this.monthTitleEl.textContent = this.calendar.getMonthName();
  }

  bindEvents() {
    // Navigation
    this.monthSelectEl.addEventListener('change', (e) => {
      this.calendar.setMonth(e.target.value);
      this.render();
    });

    this.yearSelectEl.addEventListener('change', (e) => {
      this.calendar.setYear(e.target.value);
      this.render();
    });

    this.btnPrevMonth.addEventListener('click', () => {
      this.calendar.previousMonth();
      this.render();
    });

    this.btnNextMonth.addEventListener('click', () => {
      this.calendar.nextMonth();
      this.render();
    });

    this.btnToday.addEventListener('click', () => {
      this.calendar.goToToday();
      this.render();
      this.showToast('Navigated to Current Month', 'info');
    });

    // Modals - Habit Add/Edit
    this.btnAddHabit.addEventListener('click', () => this.openAddHabitModal());
    const emptyAddBtn = document.getElementById('btnEmptyAddHabit');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => this.openAddHabitModal());
    }
    this.btnCancelHabit.addEventListener('click', () => this.closeHabitModal());
    this.habitForm.addEventListener('submit', (e) => this.handleSaveHabit(e));

    // Delete Modal
    this.btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
    this.btnConfirmDelete.addEventListener('click', () => this.handleConfirmDelete());

    // Settings Modal
    this.btnSettings.addEventListener('click', () => this.openSettingsModal());
    this.btnCancelSettings.addEventListener('click', () => this.closeSettingsModal());
    this.settingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
    this.btnResetMonth.addEventListener('click', () => this.handleResetMonth());
    this.btnResetAll.addEventListener('click', () => this.handleResetAll());

    // Demo Data
    if (this.btnDemoData) {
      this.btnDemoData.addEventListener('click', () => {
        this.storage.loadDemoData(this.calendar.currentYear, this.calendar.currentMonth);
        this.render();
        this.showToast('Loaded demo data for ' + this.calendar.getMonthName(), 'success');
      });
    }

    // Export / Import
    this.btnExport.addEventListener('click', () => this.handleExport());
    this.btnImport.addEventListener('click', () => this.importFileInput.click());
    this.importFileInput.addEventListener('change', (e) => this.handleImportFile(e));

    // Color Swatches inside modal
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        if (color) {
          this.habitColorInput.value = color;
          document.querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('selected'));
          e.target.classList.add('selected');
        }
      });
    });

    // Close modals on overlay backdrop click or Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    [this.habitModal, this.deleteModal, this.settingsModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
    });

    // Window resize handler to update charts smoothly
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderChartsAndStats();
      }, 150);
    });
  }

  render() {
    this.updateDropdownSelections();
    this.renderMotivationalCard();

    const habits = this.storage.getHabits();
    if (habits.length === 0) {
      this.emptyStateEl.style.display = 'block';
      this.gridContainerEl.style.display = 'none';
    } else {
      this.emptyStateEl.style.display = 'none';
      this.gridContainerEl.style.display = 'block';
      this.renderHabitGrid();
    }

    this.renderChartsAndStats();
  }

  renderMotivationalCard() {
    const settings = this.storage.getSettings();
    if (this.motivationalAuthorEl) {
      this.motivationalAuthorEl.textContent = settings.motivationalAuthor || 'I am...';
    }
    if (this.motivationalTextEl) {
      this.motivationalTextEl.textContent = settings.motivationalText || 'Focused, intentional, and ready for the month ahead.';
    }
  }

  renderHabitGrid() {
    const settings = this.storage.getSettings();
    const monthData = this.calendar.getMonthData(settings.firstDayOfWeek);
    const habits = this.storage.getHabits();
    const completions = this.storage.getCompletions();

    let theadHtml = '';

    // Row 1: Week headers ("week 1", "week 2", ...)
    theadHtml += '<tr class="grid-header-weeks">';
    theadHtml += '<th class="sticky-col-header" rowspan="3"><div class="daily-habits-banner">DAILY HABITS</div></th>';
    monthData.weeks.forEach((w, wIdx) => {
      const color = ChartService.getWeekColor(wIdx);
      theadHtml += `<th colspan="${w.days.length}" class="week-header-cell week-${wIdx + 1}" style="--week-color: ${color.primary}; --week-light: ${color.light};">
        <span class="week-pill">week ${w.weekNumber}</span>
      </th>`;
    });
    theadHtml += '</tr>';

    // Row 2: Day numbers (1, 2, 3... 31)
    theadHtml += '<tr class="grid-header-days">';
    monthData.days.forEach(d => {
      const color = ChartService.getWeekColor(d.weekIndex);
      theadHtml += `<th class="day-number-cell ${d.isToday ? 'is-today' : ''}" style="--cell-bg: ${color.light}; --cell-color: ${color.border};" title="${monthData.monthName} ${d.day} (${d.dayFullName})">
        ${d.day}
      </th>`;
    });
    theadHtml += '</tr>';

    // Row 3: Day letters (M, T, W, T, F, S, S)
    theadHtml += '<tr class="grid-header-letters">';
    monthData.days.forEach(d => {
      const color = ChartService.getWeekColor(d.weekIndex);
      theadHtml += `<th class="day-letter-cell ${d.isWeekend ? 'is-weekend' : ''} ${d.isToday ? 'is-today' : ''}" style="--cell-color: ${color.border};">
        ${d.dayLetter}
      </th>`;
    });
    theadHtml += '</tr>';

    // Table Body: Habit rows
    let tbodyHtml = '';
    habits.forEach((habit, idx) => {
      tbodyHtml += `
        <tr class="habit-row" data-habit-id="${habit.id}" draggable="true">
          <td class="sticky-col habit-title-cell">
            <div class="habit-row-info">
              <span class="drag-handle" title="Drag to reorder" aria-label="Reorder habit">⋮⋮</span>
              <span class="habit-idx-num">${idx + 1}</span>
              <span class="habit-color-dot" style="background-color: ${habit.color || '#6ea8fe'};"></span>
              <span class="habit-name-text" title="${this.escapeHtml(habit.name)}">${this.escapeHtml(habit.name)}</span>
              <div class="habit-actions">
                <button type="button" class="btn-icon btn-edit-habit" data-id="${habit.id}" title="Edit habit" aria-label="Edit ${this.escapeHtml(habit.name)}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button type="button" class="btn-icon btn-delete-habit" data-id="${habit.id}" title="Delete habit" aria-label="Delete ${this.escapeHtml(habit.name)}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </td>
      `;

      monthData.days.forEach(d => {
        const isChecked = this.storage.isCompleted(d.dateKey, habit.id);
        const weekColor = ChartService.getWeekColor(d.weekIndex);

        tbodyHtml += `
          <td class="habit-check-cell ${d.isToday ? 'cell-today' : ''}" style="--week-color: ${weekColor.primary}; --week-light: ${weekColor.light}; --week-border: ${weekColor.border};">
            <button type="button"
              class="habit-checkbox ${isChecked ? 'checked' : ''}"
              data-date="${d.dateKey}"
              data-habit-id="${habit.id}"
              aria-label="${this.escapeHtml(habit.name)} on ${monthData.monthName} ${d.day} ${isChecked ? 'Completed' : 'Not completed'}"
              role="checkbox"
              aria-checked="${isChecked}">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </td>
        `;
      });

      tbodyHtml += '</tr>';
    });

    this.habitGridTable.innerHTML = `
      <thead>${theadHtml}</thead>
      <tbody>${tbodyHtml}</tbody>
    `;

    this.bindGridInteractions();
  }

  bindGridInteractions() {
    // Checkbox clicks (delegated or direct)
    this.habitGridTable.querySelectorAll('.habit-checkbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dateKey = btn.getAttribute('data-date');
        const habitId = btn.getAttribute('data-habit-id');
        const newState = this.storage.toggleCompletion(dateKey, habitId);

        if (newState) {
          btn.classList.add('checked');
          btn.setAttribute('aria-checked', 'true');
        } else {
          btn.classList.remove('checked');
          btn.setAttribute('aria-checked', 'false');
        }

        // Dynamically update stats and charts without re-rendering the entire table DOM
        this.renderChartsAndStats();
      });
    });

    // Edit and Delete buttons on habit rows
    this.habitGridTable.querySelectorAll('.btn-edit-habit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.openEditHabitModal(id);
      });
    });

    this.habitGridTable.querySelectorAll('.btn-delete-habit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.openDeleteModal(id);
      });
    });

    // Drag & Drop reordering
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    const rows = this.habitGridTable.querySelectorAll('tbody tr.habit-row');
    let draggedRow = null;

    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedRow = row;
        this.draggedHabitId = row.getAttribute('data-habit-id');
        row.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedHabitId);
      });

      row.addEventListener('dragend', () => {
        if (draggedRow) draggedRow.classList.remove('is-dragging');
        rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
      });

      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        rows.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        if (e.clientY < midY) {
          row.classList.add('drag-over-top');
        } else {
          row.classList.add('drag-over-bottom');
        }
      });

      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over-top', 'drag-over-bottom');
        if (!draggedRow || draggedRow === row) return;

        const allRows = Array.from(this.habitGridTable.querySelectorAll('tbody tr.habit-row'));
        const draggedIndex = allRows.indexOf(draggedRow);
        const targetIndex = allRows.indexOf(row);

        const rect = row.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midY;

        const habits = this.storage.getHabits();
        const reorderedIds = habits.map(h => h.id);
        const [movedId] = reorderedIds.splice(draggedIndex, 1);

        let newTargetIdx = targetIndex;
        if (draggedIndex < targetIndex) {
          newTargetIdx = insertBefore ? targetIndex - 1 : targetIndex;
        } else {
          newTargetIdx = insertBefore ? targetIndex : targetIndex + 1;
        }

        reorderedIds.splice(newTargetIdx, 0, movedId);
        this.storage.reorderHabits(reorderedIds);
        this.render();
        this.showToast('Habits reordered successfully', 'info');
      });
    });
  }

  renderChartsAndStats() {
    const settings = this.storage.getSettings();
    const monthData = this.calendar.getMonthData(settings.firstDayOfWeek);
    const habits = this.storage.getHabits();
    const completions = this.storage.getCompletions();

    const stats = StatisticsService.calculateMonthStats(monthData, habits, completions);

    // Update monthly summary stat cards
    this.statMonthlyPctEl.textContent = `${stats.monthlyPercentage}%`;
    this.statCompletedCountEl.textContent = stats.completedCheckins;
    this.statPossibleCountEl.textContent = stats.possibleCheckins;

    if (stats.bestDay.day && stats.bestDay.day !== '-') {
      this.statBestDayEl.textContent = `${monthData.monthName} ${stats.bestDay.day} (${stats.bestDay.percentage}%)`;
    } else {
      this.statBestDayEl.textContent = 'None yet';
    }

    if (stats.bestHabit && stats.bestHabit.completedCount > 0) {
      this.statBestHabitEl.textContent = `${stats.bestHabit.name} (${stats.bestHabit.percentage}%)`;
    } else {
      this.statBestHabitEl.textContent = 'None yet';
    }

    this.statCurrentStreakEl.textContent = `${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}`;
    this.statLongestStreakEl.textContent = `${stats.longestStreak} day${stats.longestStreak === 1 ? '' : 's'}`;

    // Render Weekly Analytics (Bars + Progress Rings)
    this.chartService.renderWeeklyAnalytics(this.weeklyAnalyticsContainer, monthData, stats);

    // Render Top Trend Wave Chart
    this.chartService.renderTrendChart(this.trendChartCanvas, monthData, stats);
  }

  // --- Modal & Action Handlers ---

  openAddHabitModal() {
    this.currentEditingHabitId = null;
    this.habitModalTitle.textContent = 'Add New Habit';
    this.habitNameInput.value = '';
    this.habitDescInput.value = '';
    this.habitColorInput.value = '#6ea8fe';
    this.resetColorSwatchSelection('#6ea8fe');
    this.habitModal.classList.add('active');
    setTimeout(() => this.habitNameInput.focus(), 100);
  }

  openEditHabitModal(id) {
    const habit = this.storage.getHabits().find(h => h.id === id);
    if (!habit) return;

    this.currentEditingHabitId = id;
    this.habitModalTitle.textContent = 'Edit Habit';
    this.habitNameInput.value = habit.name;
    this.habitDescInput.value = habit.description || '';
    this.habitColorInput.value = habit.color || '#6ea8fe';
    this.resetColorSwatchSelection(habit.color || '#6ea8fe');
    this.habitModal.classList.add('active');
    setTimeout(() => this.habitNameInput.focus(), 100);
  }

  resetColorSwatchSelection(color) {
    document.querySelectorAll('.color-swatch-btn').forEach(b => {
      b.classList.toggle('selected', b.getAttribute('data-color') === color);
    });
  }

  closeHabitModal() {
    this.habitModal.classList.remove('active');
    this.currentEditingHabitId = null;
    this.habitForm.reset();
  }

  handleSaveHabit(e) {
    e.preventDefault();
    const name = this.habitNameInput.value.trim();
    if (!name) {
      this.showToast('Please enter a habit name', 'warning');
      this.habitNameInput.focus();
      return;
    }

    const description = this.habitDescInput.value.trim();
    const color = this.habitColorInput.value || '#6ea8fe';

    if (this.currentEditingHabitId) {
      this.storage.updateHabit(this.currentEditingHabitId, { name, description, color });
      this.showToast(`Updated "${name}"`, 'success');
    } else {
      this.storage.addHabit({ name, description, color });
      this.showToast(`Added habit "${name}"`, 'success');
    }

    this.closeHabitModal();
    this.render();
  }

  openDeleteModal(id) {
    const habit = this.storage.getHabits().find(h => h.id === id);
    if (!habit) return;

    this.pendingDeleteHabitId = id;
    this.deleteHabitNameEl.textContent = `"${habit.name}"`;
    this.deleteModal.classList.add('active');
  }

  closeDeleteModal() {
    this.deleteModal.classList.remove('active');
    this.pendingDeleteHabitId = null;
  }

  handleConfirmDelete() {
    if (!this.pendingDeleteHabitId) return;
    const habit = this.storage.getHabits().find(h => h.id === this.pendingDeleteHabitId);
    const name = habit ? habit.name : 'Habit';
    this.storage.deleteHabit(this.pendingDeleteHabitId);
    this.closeDeleteModal();
    this.render();
    this.showToast(`Deleted "${name}"`, 'info');
  }

  openSettingsModal() {
    const settings = this.storage.getSettings();
    this.settingMotivText.value = settings.motivationalText || '';
    this.settingMotivAuthor.value = settings.motivationalAuthor || 'I am...';
    this.settingFirstDay.value = settings.firstDayOfWeek || 'monday';
    this.settingsModal.classList.add('active');
  }

  closeSettingsModal() {
    this.settingsModal.classList.remove('active');
  }

  handleSaveSettings(e) {
    e.preventDefault();
    const motivationalText = this.settingMotivText.value.trim();
    const motivationalAuthor = this.settingMotivAuthor.value.trim() || 'I am...';
    const firstDayOfWeek = this.settingFirstDay.value;

    this.storage.updateSettings({
      motivationalText,
      motivationalAuthor,
      firstDayOfWeek
    });

    this.closeSettingsModal();
    this.render();
    this.showToast('Settings saved successfully', 'success');
  }

  handleResetMonth() {
    if (confirm(`Are you sure you want to clear all check-ins for ${this.calendar.getMonthName()} ${this.calendar.currentYear}? This action cannot be undone.`)) {
      this.storage.resetCurrentMonth(this.calendar.currentYear, this.calendar.currentMonth);
      this.closeSettingsModal();
      this.render();
      this.showToast(`Cleared check-ins for ${this.calendar.getMonthName()} ${this.calendar.currentYear}`, 'info');
    }
  }

  handleResetAll() {
    if (confirm('DANGER: Are you sure you want to reset ALL habits and completion data back to default factory settings?')) {
      this.storage.resetAllData();
      this.closeSettingsModal();
      this.render();
      this.showToast('Reset all data to default state', 'info');
    }
  }

  handleExport() {
    const jsonStr = this.storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `habit-tracker-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Exported habit data backup successfully', 'success');
  }

  handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = this.storage.importJSON(content);
      if (res.success) {
        this.render();
        this.showToast('Imported data successfully!', 'success');
      } else {
        this.showToast(`Import failed: ${res.error}`, 'warning');
      }
      this.importFileInput.value = '';
    };
    reader.onerror = () => {
      this.showToast('Failed to read file', 'warning');
      this.importFileInput.value = '';
    };
    reader.readAsText(file);
  }

  closeAllModals() {
    this.closeHabitModal();
    this.closeDeleteModal();
    this.closeSettingsModal();
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-text">${this.escapeHtml(message)}</span>
    `;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new HabitTrackerApp();
});

})();
