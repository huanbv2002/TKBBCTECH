/**
 * TKB - Month View Renderer
 */
function renderMonth() {
  const year = focusMonth.getFullYear();
  const month = focusMonth.getMonth();
  const monthTitle = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(focusMonth);
  if ($('month-label')) $('month-label').textContent = monthTitle;
  if ($('month-mobile-label')) $('month-mobile-label').textContent = monthTitle;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  let html = dayNames.map((name) => `<div class="calendar-day-head">${name}</div>`).join('');

  for (let index = 0; index < first.getDay(); index += 1) {
    html += '<div class="calendar-cell muted"></div>';
  }

  const todayStr = dateOnly(now()).toDateString();

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const week = weekForDate(date);
    const holiday = getHolidayForDate(dateKey);
    const items = week >= 1 && week <= maxWeeks() ? schedule.filter((item) => item.dow === schoolDayForDate(date) && item.weeks.includes(week)) : [];
    const dayNotes = notes[dateKey] || [];
    const isToday = date.toDateString() === todayStr;
    const hasContent = items.length > 0 || dayNotes.length > 0 || holiday;
    const isEmptyDay = !hasContent;

    html += `
      <div class="calendar-cell ${isToday ? 'today' : ''} ${dayNotes.length ? 'has-notes' : ''} ${holiday ? 'has-holiday' : ''} ${isEmptyDay ? 'is-empty-day' : 'has-events'}" data-date="${dateKey}" title="Bấm để xem và thêm ghi chú ngày ${day}/${month + 1}">
        <div class="calendar-cell-top">
          <div class="calendar-number-wrap">
            <span class="calendar-number">${day}</span>
            ${isToday ? '<span class="today-tag">Hôm nay</span>' : ''}
            ${holiday ? '<span class="holiday-pill-tag">NGHỈ LỄ</span>' : ''}
          </div>
          ${dayNotes.length ? `
            <span class="cal-note-badge" title="Có ${dayNotes.length} ghi chú cho ngày này">
              ${NOTE_ICON_SVG}
              ${dayNotes.length > 1 ? `<b>${dayNotes.length}</b>` : ''}
            </span>
          ` : ''}
        </div>
        
        ${holiday ? `
          <div class="cal-holiday-badge" title="${escapeHtml(holiday.name)}: ${escapeHtml(holiday.note)}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Nghỉ Lễ: ${escapeHtml(holiday.name)}</span>
          </div>
        ` : ''}

        ${dayNotes.length ? `
          <div class="cal-note-list">
            ${dayNotes.slice(0, 2).map((txt) => `
              <div class="cal-note-card" title="${escapeHtml(txt)}">
                ${NOTE_ICON_SVG}
                <span class="text">${escapeHtml(txt)}</span>
              </div>
            `).join('')}
            ${dayNotes.length > 2 ? `<div class="cal-note-card" style="opacity:0.75; font-size: 8.5px;">+${dayNotes.length - 2} ghi chú nữa</div>` : ''}
          </div>
        ` : ''}

        <div class="cal-events-container">
          ${holiday ? `
            <div class="cal-holiday-notice-box">
              <strong>Nghỉ toàn trường</strong>
              <small>${escapeHtml(holiday.name)}</small>
            </div>
          ` : items.map((item) => `<div class="cal-event ${item.color || ''}" title="${escapeHtml(item.subject)} · ${escapeHtml(item.room)}">${escapeHtml(displayTime(item.periods).split('–')[0])} ${escapeHtml(item.subject)}</div>`).join('')}
        </div>
      </div>`;
  }
  $('calendar').innerHTML = html;
}
