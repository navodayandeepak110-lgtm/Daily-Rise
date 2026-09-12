/**
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

export class StorageManager {
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
