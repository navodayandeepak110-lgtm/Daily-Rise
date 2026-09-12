# Habit Tracker Dashboard

A polished, responsive, and offline-first **Monthly Habit Tracking Web Application** crafted with HTML5, CSS3, and Vanilla JavaScript (ES6+), closely based on the reference design.

![Habit Tracker Dashboard](assets/preview.png)

---

## 🌟 Features

### 1. Dynamic Calendar & Month Navigation
- **All 12 Months Supported**: Dynamically renders calendar grids for any month and year (January through December).
- **Accurate Leap Years & Day Counts**: Seamlessly handles 28/29-day Februaries, 30-day, and 31-day months.
- **Fast Navigation**: Jump quickly between months using `Prev`, `Next`, and `Today` buttons, or choose any month/year directly from the vintage gold dropdown controls.
- **No Page Reloads**: All transitions and state updates happen dynamically and instantly.

### 2. Habit Management (CRUD & Reordering)
- **Default Sample Habits**: Automatically initializes with 14 curated productivity and wellness habits on first launch.
- **Add Habit**: Modal with name, optional motivation/description, and color swatch picker.
- **Edit Habit**: Modify existing habit names, descriptions, or color themes anytime.
- **Delete Habit**: Safe deletion with confirmation modal.
- **Drag & Drop Reordering**: Drag rows up and down using the grip handles (`⋮⋮`) to customize your priority order.

### 3. Habit Tracking Grid (Monthly Matrix)
- **Responsive & Sticky Layout**: Habit names and action buttons remain pinned on the left (`position: sticky`) while the 31 day columns scroll horizontally.
- **Custom Themed Checkboxes**:
  - Color-coded borders matching the week's pastel palette.
  - Checked state filled with the week's solid pastel color and a crisp SVG checkmark.
- **Live Sync**: Every check/uncheck immediately persists to `localStorage` and triggers instant recalculation of all analytics.

### 4. Visual Analytics & Charts
- **Weekly Analytics**:
  - **Dynamic Daily Bar Charts**: Displays day-by-day completion percentages (0% to 100%) and day numbers (1..31) colored by week:
    - *Week 1*: Pastel Blue (`#7BAEFA`)
    - *Week 2*: Pastel Pink (`#F48FB1`)
    - *Week 3*: Pastel Teal (`#4DD0E1`)
    - *Week 4*: Pastel Gold (`#F6BD60`)
    - *Week 5*: Pastel Steel Blue (`#90CAF9`)
    - *Week 6*: Pastel Lilac (`#CE93D8`)
  - **Circular Progress Rings**: SVG progress rings under each week displaying real weekly completion percentages.
- **Top Decorative Monthly Trend Wave**: Smooth bezier area chart visualizing daily completion trends across the entire month. Uses Chart.js with an automatic Canvas fallback for offline reliability.

### 5. Detailed Monthly Statistics & Streaks
- **Monthly Completion Rate**: Overall percentage of completed habits for the month.
- **Total Check-ins**: Completed vs. Possible check-ins count.
- **Best Day & Best Habit**: Peak performance day and most consistent habit.
- **Streaks**: Real-time calculation of **Current Streak** and **Longest Streak**.

### 6. Personalization, Demo Data, Export & Import
- **Motivational Card**: Embedded illustration of mindful focus with customizable quote ("I am... Focused, intentional, and ready for the month ahead.").
- **Demo Data Generator**: Single-click "Demo Data" button to instantly populate realistic check-ins matching the screenshot style.
- **Data Portability**:
  - **Export Data**: Download complete habits and history as a formatted `.json` backup file.
  - **Import Data**: Restore or transfer data across browsers with schema validation.
- **Danger Zone**: Reset the current month or reset all data back to factory defaults.

---

## 📂 Project Structure

```
habit-tracker/
│
├── index.html              # Main HTML markup with accessible semantic layout
├── css/
│   └── style.css           # Complete pastel stylesheet, responsive grid & CSS variables
├── js/
│   ├── app.js              # Application controller, modal handling & drag-and-drop
│   ├── storage.js          # LocalStorage CRUD, export/import & demo data generator
│   ├── calendar.js         # Month/day calculations & week grouping
│   ├── statistics.js       # Daily %, weekly %, monthly stats, best days & streaks
│   └── charts.js           # Chart.js trend wave, daily bars & SVG circular rings
│
├── assets/                 # Icons, screenshots and graphics
└── README.md               # Project documentation
```

---

## 🚀 How to Run

Because this is a pure web application built with vanilla web standards:

1. **Direct Browser Execution**:
   - Open `index.html` directly in any modern browser (Chrome, Firefox, Edge, Safari).
   - *Note*: If opening locally via `file://`, modern browsers might restrict ES modules. It is recommended to use a lightweight local server:

2. **Using a Local Server (Recommended)**:
   - With Python:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000`.
   - With VS Code:
     Right-click `index.html` and select **"Open with Live Server"**.
   - With Node.js / npx:
     ```bash
     npx serve .
     ```

---

## 💾 How LocalStorage Works

All data is stored in the browser's `localStorage` under the key `habit_tracker_data_v1`:

```json
{
  "habits": [
    {
      "id": "h-1",
      "name": "Review class notes",
      "description": "Review summary notes taken during class",
      "color": "#6ea8fe",
      "position": 1,
      "createdAt": "2026-09-11T12:00:00.000Z"
    }
  ],
  "completions": {
    "2026-09-01": {
      "h-1": true,
      "h-2": false
    }
  },
  "settings": {
    "motivationalAuthor": "I am...",
    "motivationalText": "Focused, intentional, and ready for the month ahead.",
    "firstDayOfWeek": "monday",
    "theme": "pastel-light"
  }
}
```

- **Persistence**: Checkbox states, newly created habits, and custom quotes remain saved even if the browser is closed or refreshed.
- **Zero DOM dependency**: The application data state is the sole source of truth.

---

## 🔄 How to Reset Data

1. Click **Settings** in the header.
2. In the **Danger Zone**:
   - Click **Reset Selected Month** to clear only the current month's check-ins.
   - Click **Reset All Data** to restore original default habits and clear all check-in history.

---

## 📤 How to Export / Import Data

- **Export**: Click the **Export** button in the header. A `.json` file named `habit-tracker-backup-YYYY-MM-DD.json` will download.
- **Import**: Click **Import** and select your previously saved JSON file. The system will validate the schema and immediately load your data.

---

## ⚠️ Known Limitations & Notes

- **Offline Chart.js**: Chart.js is loaded via CDN (`cdn.jsdelivr.net`). If loaded completely offline without internet connectivity, the application automatically switches to a built-in pure HTML5 Canvas fallback renderer for the monthly trend chart, ensuring zero visual breakdown.
- **Browser-Scoped Storage**: `localStorage` is tied to the specific browser and device. Use the **Export/Import** feature to transfer your habits to other devices.
