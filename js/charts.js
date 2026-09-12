/**
 * charts.js - Top Trend Area Chart & Weekly Analytics Visualization
 */

export class ChartService {
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
