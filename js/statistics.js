/**
 * statistics.js - Analytics, progress, and streak calculations
 */

export class StatisticsService {
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
