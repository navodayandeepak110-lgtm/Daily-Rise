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
