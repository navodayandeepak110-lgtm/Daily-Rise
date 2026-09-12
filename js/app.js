/**
 * app.js - Main Application Controller
 */

import { StorageManager } from './storage.js';
import { CalendarService, MONTH_NAMES } from './calendar.js';
import { StatisticsService } from './statistics.js';
import { ChartService } from './charts.js';

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
