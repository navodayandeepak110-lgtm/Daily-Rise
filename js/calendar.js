/**
 * calendar.js - Calendar and Date calculations
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_LETTERS_MON = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Monday first: Mon=0 .. Sun=6
export const DAY_LETTERS_SUN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday first: Sun=0 .. Sat=6

export const DAY_FULL_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export class CalendarService {
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
   * grouped into weeks matching the calendar according to firstDayOfWeek ('monday' or 'sunday').
   */
  getMonthData(firstDayOfWeek = 'monday') {
    const totalDays = this.getDaysInMonth();
    const today = new Date();
    const todayKey = this.formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const startDayIdx = (firstDayOfWeek === 'sunday') ? 0 : 1; // 0 = Sunday, 1 = Monday
    let currentWeekIndex = 0;

    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, d);
      const dayOfWeekIdx = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dateKey = this.formatDateKey(this.currentYear, this.currentMonth, d);

      // Increment week when transitioning onto start day of week
      if (d > 1 && dayOfWeekIdx === startDayIdx) {
        currentWeekIndex++;
      }

      // Letter representation based on day of week
      const letterMap = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const letter = letterMap[dayOfWeekIdx];

      const dateTime = dateObj.getTime();
      const isToday = (dateKey === todayKey);
      const isPast = dateTime < todayMidnight;
      const isFuture = dateTime > todayMidnight;

      days.push({
        day: d,
        dateKey,
        dayOfWeekIdx,
        dayLetter: letter,
        dayFullName: DAY_FULL_NAMES[dayOfWeekIdx],
        weekIndex: currentWeekIndex,
        isToday,
        isPast,
        isFuture,
        isWeekend: (dayOfWeekIdx === 0 || dayOfWeekIdx === 6)
      });
    }

    // Group into weeks
    const weeks = [];
    const uniqueWeekIndices = [...new Set(days.map(d => d.weekIndex))];

    uniqueWeekIndices.forEach((wIdx, num) => {
      const weekDays = days.filter(d => d.weekIndex === wIdx);
      weeks.push({
        weekNumber: num + 1,
        weekName: `Week ${num + 1}`,
        days: weekDays,
        startDay: weekDays[0].day,
        endDay: weekDays[weekDays.length - 1].day
      });
    });

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
