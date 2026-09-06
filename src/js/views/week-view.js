/**
 * TKB - Week View Renderer
 * 
 * 2 Main Modes on Mobile:
 * 1. 'agenda' -> Từng ngày (Day Agenda Feed with Day Tabs & Touch Swipe)
 * 2. 'week'   -> Cả tuần (Whole week view)
 * 
 * In 'week' mode, user can toggle sub-layout:
 * - 'vertical'   -> Bảng dọc (Vertical Days x Morning/Afternoon columns - fits 100% on phone)
 * - 'horizontal' -> Lưới ngang (7-Column Grid with horizontal scrolling)
 */

let activeMobileDow = null;
let mobileScheduleMode = 'agenda'; // 'agenda' | 'week'
let weekSubLayout = 'horizontal';     // 'vertical' | 'horizontal'

// Load saved preferences
try {
  const savedMainMode = localStorage.getItem('tkb-mobile-mainmode-v2');
  if (savedMainMode && ['agenda', 'week'].includes(savedMainMode)) {
    mobileScheduleMode = savedMainMode;
  }
  const savedSubLayout = localStorage.getItem('tkb-week-sublayout-v2');
  if (savedSubLayout && ['vertical', 'horizontal'].includes(savedSubLayout)) {
    weekSubLayout = savedSubLayout;
  }
} catch (_) {}

function renderWeek() {
  focusWeek = clampWeek(focusWeek);
  const events = eventsForWeek(focusWeek);
  const from = dateAt(focusWeek, 2);
  const to = dateAt(focusWeek, 8);
  const weekHolidays = getHolidaysForWeek(focusWeek);
  
  const weekRangeEl = $('week-range');
  if (weekRangeEl) {
    weekRangeEl.textContent = `Tuần ${focusWeek} (${formatDate(from)} – ${formatDate(to)})`;
  }
  
  if ($('week-select')) $('week-select').value = focusWeek;

  const todayDate = dateOnly(now());
  const isCurrentWeek = focusWeek === currentWeek();

  // Find default active day for mobile
  if (!activeMobileDow) {
    if (isCurrentWeek) {
      const todayDow = now().getDay() === 0 ? 8 : now().getDay() + 1;
      activeMobileDow = todayDow;
    } else {
      activeMobileDow = 2; // Monday
    }
  }

  // 1. Render Mobile Day Tabs
  let mobileTabsHtml = '';
  dayOrder.forEach((dow) => {
    const d = dateAt(focusWeek, dow);
    const dateKey = formatDateKey(d);
    const holiday = getHolidayForDate(dateKey);
    const isToday = isCurrentWeek && d.toDateString() === todayDate.toDateString();
    const isActive = activeMobileDow === dow;
    const hasEvents = events.some((item) => item.dow === dow);
    const isEmptyDay = !hasEvents && !holiday;
    
    mobileTabsHtml += `
      <button class="mobile-day-tab ${isActive ? 'active' : ''} ${isToday ? 'today' : ''} ${holiday ? 'holiday' : ''} ${isEmptyDay ? 'is-empty-day' : ''}" 
              data-dow="${dow}" 
              onclick="selectMobileDay(${dow})"
              type="button"
              title="${shortDay(dow)} ${d.getDate()}/${d.getMonth() + 1}">
        <span>${shortDay(dow)}</span>
        <b>${d.getDate()}/${d.getMonth() + 1}</b>
        ${hasEvents ? '<div class="tab-has-event-dot"></div>' : ''}
      </button>
    `;
  });
  const mobileTabsEl = $('mobile-day-tabs');
  if (mobileTabsEl) mobileTabsEl.innerHTML = mobileTabsHtml;

  // 2. Render Mobile Agenda Feed
  renderMobileAgendaFeed(events, isCurrentWeek, todayDate);

  // 3. Render Mobile Transposed Table (Bảng Dọc)
  renderMobileVerticalTable(events, weekHolidays, isCurrentWeek, todayDate);

  // 4. Render Desktop / Horizontal Grid (Lưới Ngang)
  renderDesktopGrid(events, weekHolidays, isCurrentWeek, todayDate);

  // Update UI visibility
  updateMobileScheduleVisibility();
}

function renderDesktopGrid(events, weekHolidays, isCurrentWeek, todayDate) {
  let desktopHtml = '';

  if (weekHolidays.length > 0) {
    const holidayNames = weekHolidays.map((h) => `${h.name} (${h.displayDate})`).join(' · ');
    desktopHtml += `
      <div style="grid-column: 1 / -1; margin-bottom: 10px;">
        <div class="week-holiday-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span><b>Lưu ý nghỉ Lễ/Tết trong Tuần ${focusWeek}:</b> ${escapeHtml(holidayNames)}</span>
        </div>
      </div>
    `;
  }

  desktopHtml += '<div class="week-head">Buổi</div>' + dayOrder.map((dow) => {
    const d = dateAt(focusWeek, dow);
    const dateKey = formatDateKey(d);
    const holiday = getHolidayForDate(dateKey);
    const isToday = isCurrentWeek && d.toDateString() === todayDate.toDateString();
    const dayHasEvents = events.some((item) => item.dow === dow);
    const isEmptyDay = !dayHasEvents && !holiday;
    return `
      <div class="week-head ${isToday ? 'is-today' : ''} ${holiday ? 'is-holiday' : ''} ${isEmptyDay ? 'is-empty-day' : ''}" id="day-col-${dow}">
        ${shortDay(dow)}<b>${d.getDate()}/${d.getMonth() + 1}</b>
        ${holiday ? `<span class="holiday-head-tag">Nghỉ Lễ</span>` : ''}
        ${isEmptyDay ? `<span class="empty-day-head-tag">Không có tiết</span>` : ''}
      </div>`;
  }).join('');

  desktopHtml += `<div class="time-cell note-row-label">Ghi chú<small>Nhắc nhở</small></div>`;
  for (const dow of dayOrder) {
    const d = dateAt(focusWeek, dow);
    const dateKey = formatDateKey(d);
    const holiday = getHolidayForDate(dateKey);
    const dayNotes = notes[dateKey] || [];
    const dayHasEvents = events.some((item) => item.dow === dow);
    const isEmptyDay = !dayHasEvents && !holiday;
    desktopHtml += `
      <div class="slot note-slot ${holiday ? 'holiday-slot' : ''} ${isEmptyDay ? 'empty-day-slot' : ''}" data-date="${dateKey}" title="Bấm để xem và thêm ghi chú ngày ${d.getDate()}/${d.getMonth() + 1}">
        ${dayNotes.length ? `
          <div class="week-note-list">
            ${dayNotes.map((txt) => `
              <div class="week-note-pill" title="${escapeHtml(txt)}">
                ${NOTE_ICON_SVG}
                <span class="text">${escapeHtml(txt)}</span>
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-note-hint">${holiday ? 'Ghi chú ngày lễ' : '+ Ghi chú'}</div>`}
      </div>`;
  }

  for (const session of sessionOrder) {
    const info = PERIOD_GROUPS[session];
    desktopHtml += `<div class="time-cell">${info.label}<small>${info.start}</small></div>`;
    for (const dow of dayOrder) {
      const d = dateAt(focusWeek, dow);
      const dateKey = formatDateKey(d);
      const holiday = getHolidayForDate(dateKey);
      const isToday = isCurrentWeek && d.toDateString() === todayDate.toDateString();
      const cell = events.filter((item) => item.dow === dow && item.session === session);
      const dayHasEvents = events.some((item) => item.dow === dow);
      const hasCellEvents = cell.length > 0;
      const isEmptySlot = !hasCellEvents && !holiday;
      desktopHtml += `
        <div class="slot ${isToday ? 'is-today' : ''} ${holiday ? 'holiday-slot' : ''} ${isEmptySlot ? 'is-empty-slot' : 'has-events-slot'}">
          ${cell.length ? `
            <div class="event-list">${cell.map((item) => `
              <div class="event ${item.color || ''} ${holiday ? 'holiday-cancelled' : ''}">
                <strong>${escapeHtml(item.subject)}</strong>
                <small>${escapeHtml(periodLabel(item.periods))} (${escapeHtml(displayTime(item.periods))})</small>
                <small>Phòng: <b>${escapeHtml(item.room)}</b></small>
                ${holiday ? `<span class="event-holiday-tag">Nghỉ Lễ: ${escapeHtml(holiday.name)}</span>` : (item.teacher ? `<small class="teacher-name">${escapeHtml(item.teacher)}</small>` : '')}
              </div>`).join('')}
            </div>` : (holiday ? `
            <div class="holiday-empty-slot">
              <span class="holiday-slot-badge">Nghỉ Lễ</span>
              <span class="holiday-slot-text">${escapeHtml(holiday.name)}</span>
            </div>
          ` : '')}
        </div>`;
    }
  }

  const weekBoardEl = $('week-board');
  if (weekBoardEl) weekBoardEl.innerHTML = desktopHtml;
}

function renderMobileAgendaFeed(events, isCurrentWeek, todayDate) {
  const agendaWrap = $('mobile-agenda-view');
  if (!agendaWrap) return;

  const dow = activeMobileDow || 2;
  const d = dateAt(focusWeek, dow);
  const dateKey = formatDateKey(d);
  const holiday = getHolidayForDate(dateKey);
  const isToday = isCurrentWeek && d.toDateString() === todayDate.toDateString();
  const dayEvents = events.filter((item) => item.dow === dow);
  const dayNotes = notes[dateKey] || [];

  const fullDayName = ({
    2: 'Thứ Hai',
    3: 'Thứ Ba',
    4: 'Thứ Tư',
    5: 'Thứ Năm',
    6: 'Thứ Sáu',
    7: 'Thứ Bảy',
    8: 'Chủ Nhật'
  })[dow] || 'Thứ';

  let html = `
    <div class="agenda-day-header">
      <div>
        <div class="agenda-day-title">${fullDayName} ${isToday ? '· (Hôm nay)' : ''}</div>
        <div class="agenda-day-date">${formatDate(d)}</div>
      </div>
      <button class="outline-btn" style="padding: 4px 10px; font-size: 11.5px; border-radius: 6px;" onclick="openNoteModal('${dateKey}')" type="button">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Ghi chú</span>
      </button>
    </div>
  `;

  if (holiday) {
    html += `
      <div class="week-holiday-banner" style="margin: 0;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span><b>Nghỉ Lễ / Tết:</b> ${escapeHtml(holiday.name)}</span>
      </div>
    `;
  }

  const morningEvents = dayEvents.filter((item) => item.session === 'morning');
  const afternoonEvents = dayEvents.filter((item) => item.session === 'afternoon');

  if (morningEvents.length === 0 && afternoonEvents.length === 0 && !holiday) {
    html += `
      <div class="agenda-empty-state">
        <div class="agenda-empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="agenda-empty-title">Không có lịch học</div>
        <div class="agenda-empty-sub">Bạn được nghỉ hoặc tự học vào ngày này.</div>
      </div>
    `;
  } else {
    if (morningEvents.length > 0) {
      html += `
        <div class="agenda-session-section">
          <div class="agenda-session-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <span>Buổi Sáng (07:25 – 11:30)</span>
          </div>
          ${morningEvents.map((item) => renderAgendaCard(item, holiday)).join('')}
        </div>
      `;
    }

    if (afternoonEvents.length > 0) {
      html += `
        <div class="agenda-session-section">
          <div class="agenda-session-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line></svg>
            <span>Buổi Chiều (12:55 – 17:00)</span>
          </div>
          ${afternoonEvents.map((item) => renderAgendaCard(item, holiday)).join('')}
        </div>
      `;
    }
  }

  if (dayNotes.length > 0) {
    html += `
      <div class="agenda-notes-card">
        <div class="agenda-notes-header">
          <span style="display: flex; align-items: center; gap: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#854d0e" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Ghi chú cá nhân (${dayNotes.length})
          </span>
        </div>
        ${dayNotes.map((txt) => `
          <div class="agenda-note-item" onclick="openNoteModal('${dateKey}')">
            <span>${escapeHtml(txt)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  agendaWrap.innerHTML = html;
}

function renderAgendaCard(item, holiday) {
  return `
    <div class="agenda-card ${item.color || 'blue'}">
      <div class="agenda-subject-title">${escapeHtml(item.subject)}</div>
      <div class="agenda-meta-row">
        <span class="agenda-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${escapeHtml(periodLabel(item.periods))} (${escapeHtml(displayTime(item.periods))})
        </span>
        <span class="agenda-badge agenda-room-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Phòng: ${escapeHtml(item.room)}
        </span>
      </div>
      ${item.teacher ? `
        <div class="agenda-teacher-row">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Giảng viên: <b>${escapeHtml(item.teacher)}</b></span>
        </div>
      ` : ''}
    </div>
  `;
}

function renderMobileVerticalTable(events, weekHolidays, isCurrentWeek, todayDate) {
  const mvtContainer = $('mobile-transposed-wrap');
  if (!mvtContainer) return;

  let html = '';

  if (weekHolidays.length > 0) {
    const holidayNames = weekHolidays.map((h) => `${h.name} (${h.displayDate})`).join(' · ');
    html += `
      <div class="week-holiday-banner" style="margin-bottom: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span><b>Lưu ý:</b> ${escapeHtml(holidayNames)}</span>
      </div>
    `;
  }

  html += `
    <div class="mvt-table">
      <div class="mvt-row mvt-header-row">
        <div class="mvt-col-day">Thứ</div>
        <div class="mvt-col-session">Sáng <small>07:25</small></div>
        <div class="mvt-col-session">Chiều <small>12:55</small></div>
      </div>
  `;

  for (const dow of dayOrder) {
    const d = dateAt(focusWeek, dow);
    const dateKey = formatDateKey(d);
    const holiday = getHolidayForDate(dateKey);
    const isToday = isCurrentWeek && d.toDateString() === todayDate.toDateString();
    const dayNotes = notes[dateKey] || [];
    const morningEvents = events.filter((item) => item.dow === dow && item.session === 'morning');
    const afternoonEvents = events.filter((item) => item.dow === dow && item.session === 'afternoon');
    const hasEvents = morningEvents.length > 0 || afternoonEvents.length > 0;

    const rowClass = [
      'mvt-row',
      isToday ? 'is-today' : '',
      holiday ? 'is-holiday' : '',
      !hasEvents && !holiday ? 'is-empty-day' : ''
    ].filter(Boolean).join(' ');

    html += `
      <div class="${rowClass}">
        <div class="mvt-col-day" onclick="openNoteModal('${dateKey}')" title="Bấm để xem/thêm ghi chú ngày ${d.getDate()}/${d.getMonth() + 1}">
          <span class="mvt-day-name">${shortDay(dow)}</span>
          <span class="mvt-day-num">${d.getDate()}/${d.getMonth() + 1}</span>
          ${isToday ? '<span class="mvt-today-badge">Nay</span>' : ''}
          ${holiday ? '<span class="mvt-holiday-badge">Nghỉ</span>' : ''}
          ${dayNotes.length ? `<span class="mvt-notes-dot" title="${dayNotes.length} ghi chú"></span>` : ''}
        </div>

        ${holiday ? `
          <div class="mvt-col-holiday-span" onclick="openNoteModal('${dateKey}')">
            <strong>Nghỉ Lễ / Tết</strong>
            <span>${escapeHtml(holiday.name)}</span>
          </div>
        ` : `
          <div class="mvt-col-session ${morningEvents.length ? 'has-classes' : 'empty-session'}" onclick="openNoteModal('${dateKey}')">
            ${morningEvents.length ? morningEvents.map((item) => `
              <div class="mvt-card ${item.color || 'blue'}">
                <strong class="mvt-card-title">${escapeHtml(item.subject)}</strong>
                <div class="mvt-card-info">
                  <span>${escapeHtml(periodLabel(item.periods))} (${escapeHtml(displayTime(item.periods))})</span>
                  <span>Phòng: <b>${escapeHtml(item.room)}</b></span>
                </div>
                ${item.teacher ? `<div class="mvt-card-teacher">${escapeHtml(item.teacher)}</div>` : ''}
              </div>
            `).join('') : '<span class="mvt-empty-hint">—</span>'}
          </div>

          <div class="mvt-col-session ${afternoonEvents.length ? 'has-classes' : 'empty-session'}" onclick="openNoteModal('${dateKey}')">
            ${afternoonEvents.length ? afternoonEvents.map((item) => `
              <div class="mvt-card ${item.color || 'blue'}">
                <strong class="mvt-card-title">${escapeHtml(item.subject)}</strong>
                <div class="mvt-card-info">
                  <span>${escapeHtml(periodLabel(item.periods))} (${escapeHtml(displayTime(item.periods))})</span>
                  <span>Phòng: <b>${escapeHtml(item.room)}</b></span>
                </div>
                ${item.teacher ? `<div class="mvt-card-teacher">${escapeHtml(item.teacher)}</div>` : ''}
              </div>
            `).join('') : '<span class="mvt-empty-hint">—</span>'}
          </div>
        `}
      </div>
    `;
  }

  html += '</div>';
  mvtContainer.innerHTML = html;
}

function updateMobileScheduleVisibility() {
  const isMobile = window.innerWidth <= 768;
  const boardWrap = document.querySelector('.week-board-wrap');
  const agendaWrap = $('mobile-agenda-view');
  const transposedWrap = $('mobile-transposed-wrap');
  const dayTabs = $('mobile-day-tabs');
  const modeToggle = $('mobile-mode-toggle');
  const subToggle = $('week-layout-subtoggle');

  if (isMobile) {
    if (modeToggle) modeToggle.style.display = 'flex';

    if (mobileScheduleMode === 'week') {
      // "Cả tuần" Mode
      if (dayTabs) dayTabs.style.display = 'none';
      if (agendaWrap) agendaWrap.style.display = 'none';
      if (subToggle) subToggle.style.display = 'flex';

      if (weekSubLayout === 'vertical') {
        // Vertical Table (Bảng dọc)
        if (transposedWrap) transposedWrap.style.display = 'block';
        if (boardWrap) boardWrap.style.display = 'none';
      } else {
        // Horizontal Grid (Lưới ngang - Default priority, fits 100% on phone)
        weekSubLayout = 'horizontal';
        if (transposedWrap) transposedWrap.style.display = 'none';
        if (boardWrap) boardWrap.style.display = 'block';
      }
    } else {
      // "Từng ngày" Mode
      if (dayTabs) dayTabs.style.display = 'flex';
      if (agendaWrap) agendaWrap.style.display = 'flex';
      if (transposedWrap) transposedWrap.style.display = 'none';
      if (boardWrap) boardWrap.style.display = 'none';
      if (subToggle) subToggle.style.display = 'none';
    }

    // Toggle active classes
    const btnAgenda = $('mode-btn-agenda');
    const btnWeek = $('mode-btn-week');
    if (btnAgenda) btnAgenda.classList.toggle('active', mobileScheduleMode === 'agenda');
    if (btnWeek) btnWeek.classList.toggle('active', mobileScheduleMode === 'week');

    const btnVert = $('layout-btn-vertical');
    const btnHoriz = $('layout-btn-horizontal');
    if (btnVert) btnVert.classList.toggle('active', weekSubLayout === 'vertical');
    if (btnHoriz) btnHoriz.classList.toggle('active', weekSubLayout === 'horizontal');
  } else {
    if (modeToggle) modeToggle.style.display = 'none';
    if (subToggle) subToggle.style.display = 'none';
    if (dayTabs) dayTabs.style.display = 'none';
    if (agendaWrap) agendaWrap.style.display = 'none';
    if (transposedWrap) transposedWrap.style.display = 'none';
    if (boardWrap) boardWrap.style.display = 'block';
  }
}

window.selectMobileDay = function(dow) {
  activeMobileDow = dow;
  document.querySelectorAll('.mobile-day-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.dow == dow);
  });
  const events = eventsForWeek(focusWeek);
  const todayDate = dateOnly(now());
  const isCurrentWeek = focusWeek === currentWeek();
  renderMobileAgendaFeed(events, isCurrentWeek, todayDate);
};

window.setMobileScheduleMode = function(mode) {
  mobileScheduleMode = mode;
  try {
    localStorage.setItem('tkb-mobile-mainmode-v2', mode);
  } catch (_) {}
  updateMobileScheduleVisibility();
};

window.setWeekLayout = function(layout) {
  weekSubLayout = layout;
  try {
    localStorage.setItem('tkb-week-sublayout-v2', layout);
  } catch (_) {}
  updateMobileScheduleVisibility();
};

// Touch swipe gestures on mobile agenda view
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('DOMContentLoaded', () => {
  const agendaView = $('mobile-agenda-view');
  if (agendaView) {
    agendaView.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    agendaView.addEventListener('touchend', (e) => {
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          if (activeMobileDow < 8) {
            selectMobileDay(activeMobileDow + 1);
          }
        } else {
          if (activeMobileDow > 2) {
            selectMobileDay(activeMobileDow - 1);
          }
        }
      }
    }, { passive: true });
  }
});
