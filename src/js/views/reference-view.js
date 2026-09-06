/**
 * TKB - 22-Week Reference View
 */
function renderReferenceTable() {
  const holidaysContainer = $('ref-holidays-list');
  if (holidaysContainer) {
    holidaysContainer.innerHTML = OFFICIAL_HOLIDAYS.map((h) => `
      <div class="ref-holiday-item ${h.type}" onclick="jumpToWeekFromRef(${h.week})" title="Bấm để xem lịch Tuần ${h.week}" role="button" tabindex="0">
        <div class="ref-holiday-date">${h.displayDate}</div>
        <div class="ref-holiday-name">${escapeHtml(h.name)}</div>
        <div class="ref-holiday-week">Tuần ${h.endWeek ? `${h.week} & ${h.endWeek}` : h.week} · ${escapeHtml(h.note)}</div>
      </div>
    `).join('');
  }

  const currentWk = currentWeek();
  const totalWeeks = 22;

  // 1. Render Desktop Table
  const tableBody = $('ref-table-body');
  if (tableBody) {
    let rowsHtml = '';
    for (let w = 1; w <= totalWeeks; w++) {
      const from = dateAt(w, 2);
      const to = dateAt(w, 8);
      const isCurrent = w === currentWk;
      const weekHolidays = getHolidaysForWeek(w);
      const isHolidayWeek = weekHolidays.length > 0;
      const isTet = w === 21 || w === 22;

      let phaseHtml = '';
      if (w <= 18) {
        phaseHtml = `<span class="phase-pill main">Học chính khóa</span>`;
      } else if (w <= 20) {
        phaseHtml = `<span class="phase-pill backup">Dự trữ & Thi HK1</span>`;
      } else {
        phaseHtml = `<span class="phase-pill holiday">Nghỉ Tết Âm Lịch</span>`;
      }

      let holidayNoteHtml = '—';
      if (isHolidayWeek) {
        holidayNoteHtml = weekHolidays.map((h) => `<span style="color: #b91c1c; font-weight: 600;">${escapeHtml(h.name)} (${h.displayDate})</span>`).join('<br>');
      }

      const rowClass = [
        isCurrent ? 'current-week-row' : '',
        isHolidayWeek ? 'holiday-week-row' : '',
        isTet ? 'tet-row' : ''
      ].filter(Boolean).join(' ');

      rowsHtml += `
        <tr class="${rowClass}" onclick="jumpToWeekFromRef(${w})" title="Bấm để xem lịch Tuần ${w}">
          <td>
            <strong style="color: ${isCurrent ? 'var(--primary)' : 'inherit'};">Tuần ${w}</strong>
            ${isCurrent ? '<span style="display:inline-block; font-size:10px; background:#2563eb; color:#fff; border-radius:3px; padding:1px 4px; margin-left:4px;">Hiện tại</span>' : ''}
          </td>
          <td>${formatDate(from)}</td>
          <td>${formatDate(to)}</td>
          <td>${phaseHtml}</td>
          <td>${holidayNoteHtml}</td>
          <td style="text-align: right;">
            <button class="ref-jump-btn" onclick="event.stopPropagation(); jumpToWeekFromRef(${w});">
              Xem tuần
            </button>
          </td>
        </tr>
      `;
    }
    tableBody.innerHTML = rowsHtml;
  }

  // 2. Render Mobile Week Cards List
  const mobileCardsContainer = $('ref-mobile-cards');
  if (mobileCardsContainer) {
    let mobileHtml = '';
    for (let w = 1; w <= totalWeeks; w++) {
      const from = dateAt(w, 2);
      const to = dateAt(w, 8);
      const isCurrent = w === currentWk;
      const weekHolidays = getHolidaysForWeek(w);
      const isHolidayWeek = weekHolidays.length > 0;
      const isTet = w === 21 || w === 22;

      let phaseLabel = 'Học chính khóa';
      let phaseClass = 'main';
      if (w > 18 && w <= 20) {
        phaseLabel = 'Dự trữ & Thi';
        phaseClass = 'backup';
      } else if (w > 20) {
        phaseLabel = 'Nghỉ Tết';
        phaseClass = 'holiday';
      }

      mobileHtml += `
        <div class="ref-mobile-item ${isCurrent ? 'is-current' : ''} ${isHolidayWeek ? 'is-holiday' : ''} ${isTet ? 'is-tet' : ''}" onclick="jumpToWeekFromRef(${w})" role="button">
          <div class="ref-mi-left">
            <div class="ref-mi-title-row">
              <strong class="ref-mi-week-title">Tuần ${w}</strong>
              ${isCurrent ? '<span class="ref-mi-curr-badge">Hiện tại</span>' : ''}
            </div>
            <div class="ref-mi-dates">${formatDate(from)} – ${formatDate(to)}</div>
            ${isHolidayWeek ? `
              <div class="ref-mi-holiday">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>${weekHolidays.map((h) => escapeHtml(h.name)).join(', ')}</span>
              </div>
            ` : ''}
          </div>
          <div class="ref-mi-right">
            <span class="phase-pill ${phaseClass}">${phaseLabel}</span>
            <svg class="ref-mi-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      `;
    }
    mobileCardsContainer.innerHTML = mobileHtml;
  }
}

window.jumpToWeekFromRef = function(w) {
  focusWeek = clampWeek(w);
  showView('week');
};
