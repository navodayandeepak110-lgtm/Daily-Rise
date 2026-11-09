/**
 * statistics.js - Analytics, progress, and streak calculations
 */

export class StatisticsService {
  /**
   * Format today's date key YYYY-MM-DD
   */
  static getTodayKey() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Get the previous day's date key YYYY-MM-DD
   */
  static getPreviousDateKey(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, '0');
    const prevD = String(date.getDate()).padStart(2, '0');
    return `${prevY}-${prevM}-${prevD}`;
  }

  /**
   * Calculate all stats for a given month's data, habits, and completions
   */
  static calculateMonthStats(monthData, habits, completions) {
    const totalHabits = habits.length;
    const totalDays = monthData.totalDays;

    if (totalHabits === 0 || totalDays === 0) {
      const globalStreak = this.calculateGlobalStreak(completions);
      return {
        dailyPercentages: monthData.days.map(() => 0),
        weeklyStats: monthData.weeks.map(w => ({ weekNumber: w.weekNumber, weekName: w.weekName, percentage: 0, completed: 0, possible: 0 })),
        monthlyPercentage: 0,
        completedCheckins: 0,
        possibleCheckins: 0,
        bestDay: { day: null, percentage: 0, dateKey: '', dayFullName: '-' },
        bestHabit: { name: 'None', completedCount: 0, percentage: 0 },
        currentStreak: globalStreak.currentStreak,
        longestStreak: globalStreak.longestStreak,
        habitStats: []
      };
    }

    const possibleCheckins = totalHabits * totalDays;
    let totalCompletedCheckins = 0;

    // Daily calculations
    const dailyPercentages = [];
    const dailyCompletedCounts = [];
    let bestDayObj = { day: null, percentage: -1, dateKey: '', dayFullName: '-' };

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
      const streak = this.calculateHabitStreak(h.id, completions);
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

    // Global Streaks (days with at least 1 completed habit, seamlessly across months)
    const globalStreak = this.calculateGlobalStreak(completions);

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
   * Calculate current and all-time longest streak for a specific habit across all months
   */
  static calculateHabitStreak(habitId, completions) {
    if (!completions) return { currentStreak: 0, longestStreak: 0 };

    const isCompleted = (key) => !!(completions[key] && completions[key][habitId]);
    const todayKey = this.getTodayKey();

    // 1. Current Active Streak: backwards from today (or yesterday if today is not checked)
    let currentStreak = 0;
    let key = todayKey;

    if (!isCompleted(key)) {
      key = this.getPreviousDateKey(key);
      if (!isCompleted(key)) {
        currentStreak = 0;
      } else {
        while (isCompleted(key)) {
          currentStreak++;
          key = this.getPreviousDateKey(key);
        }
      }
    } else {
      while (isCompleted(key)) {
        currentStreak++;
        key = this.getPreviousDateKey(key);
      }
    }

    // 2. All-Time Longest Streak: across all dates with completions for this habit
    const habitDates = [];
    for (const dKey in completions) {
      if (completions[dKey] && completions[dKey][habitId]) {
        habitDates.push(dKey);
      }
    }

    const longestStreak = this.calculateLongestStreakFromDates(habitDates);

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak)
    };
  }

  /**
   * Calculate overall daily activity streak across all months
   */
  static calculateGlobalStreak(completions) {
    if (!completions) return { currentStreak: 0, longestStreak: 0 };

    const isDayCompleted = (key) => {
      const dayData = completions[key];
      if (!dayData) return false;
      return Object.values(dayData).some(val => val === true);
    };

    const todayKey = this.getTodayKey();

    // 1. Current Active Streak
    let currentStreak = 0;
    let key = todayKey;

    if (!isDayCompleted(key)) {
      key = this.getPreviousDateKey(key);
      if (!isDayCompleted(key)) {
        currentStreak = 0;
      } else {
        while (isDayCompleted(key)) {
          currentStreak++;
          key = this.getPreviousDateKey(key);
        }
      }
    } else {
      while (isDayCompleted(key)) {
        currentStreak++;
        key = this.getPreviousDateKey(key);
      }
    }

    // 2. All-Time Longest Global Streak
    const activeDates = [];
    for (const dKey in completions) {
      if (isDayCompleted(dKey)) {
        activeDates.push(dKey);
      }
    }

    const longestStreak = this.calculateLongestStreakFromDates(activeDates);

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak)
    };
  }

  /**
   * Helper to find maximum consecutive days in an array of YYYY-MM-DD date strings
   */
  static calculateLongestStreakFromDates(dateKeys) {
    if (!dateKeys || dateKeys.length === 0) return 0;
    const sorted = [...new Set(dateKeys)].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevKey = sorted[i - 1];
      const currKey = sorted[i];
      if (this.getPreviousDateKey(currKey) === prevKey) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }

    return longest;
  }
}
