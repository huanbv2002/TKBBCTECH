/**
 * TKB - Main Application Controller
 */
let settings = loadSettings();
let schedule = loadSchedule();
let notes = loadNotes();
let activeView = 'week';
let focusWeek = currentWeek();
let focusMonth = new Date(now().getFullYear(), now().getMonth(), 1);
let activeModalDateStr = null;
let lastClockKey = '';

function updateHeader() {
  const week = currentWeek();
  if ($('brand-class')) $('brand-class').textContent = settings.classCode || 'Lớp học';
  if ($('semester-progress-label')) $('semester-progress-label').textContent = `Tuần ${week} / ${maxWeeks()}`;
  
  const statusEl = $('top-status-badge');
  if (statusEl) {
    statusEl.textContent = activeView === 'week' ? (focusWeek === week ? `Tuần ${focusWeek} (Hiện tại)` : `Tuần ${focusWeek}`) : `Tuần ${week}`;
  }

  updateWeekSelectOptions();
}

function updateWeekSelectOptions() {
  const select = $('week-select');
  if (!select) return;
  const current = focusWeek;
  let options = '';
  for (let i = 1; i <= maxWeeks(); i++) {
    const from = dateAt(i, 2);
    const to = dateAt(i, 8);
    options += `<option value="${i}" ${i === current ? 'selected' : ''}>Tuần ${i} (${from.getDate()}/${from.getMonth() + 1} - ${to.getDate()}/${to.getMonth() + 1})</option>`;
  }
  select.innerHTML = options;
}

function updateClock() {
  const current = now();
  const dateEl = $('live-date');
  if (dateEl) {
    dateEl.textContent = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(current);
  }
  
  const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}-${current.getHours()}-${current.getMinutes()}`;
  if (key !== lastClockKey) {
    lastClockKey = key;
    if (activeView === 'week') renderWeek();
    if (activeView === 'month') renderMonth();
    updateHeader();
  }
}

function showView(view) {
  activeView = view;
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.mobile-nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((element) => element.classList.remove('active-view'));
  const target = $(`${view}-view`);
  if (target) target.classList.add('active-view');

  $('page-title').textContent = ({
    week: 'Lịch tuần',
    month: 'Lịch tháng',
    reference: 'Bảng tham chiếu'
  })[view] || 'Lịch học';

  updateHeader();
  if (view === 'week') renderWeek();
  if (view === 'month') renderMonth();
  if (view === 'reference') renderReferenceTable();
}

function switchClass(classCode) {
  if (typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE && ALL_CLASSES_DATABASE[classCode]) {
    const classData = ALL_CLASSES_DATABASE[classCode];
    settings.classCode = classData.code || classCode;
    settings.semesterStart = classData.startDate || '2026-09-07';
    settings.maxWeeks = classData.maxWeeks || 18;
    saveSettings();

    schedule = (classData.schedule || []).map(normalizeScheduleRow);

    updateClassPickerButton(settings.classCode);
    focusWeek = currentWeek();
    renderWeek();
    renderMonth();
    updateHeader();
  }
}

function openPdfModal() { 
  const pdfModal = $('pdf-modal');
  if (pdfModal) {
    pdfModal.removeAttribute('hidden');
    pdfModal.classList.add('show');
    const dropzone = $('pdf-dropzone');
    const processCard = $('pdf-processing-card');
    const resultCard = $('pdf-result-card');
    if (dropzone) dropzone.style.display = 'flex';
    if (processCard) processCard.style.display = 'none';
    if (resultCard) resultCard.style.display = 'none';
  } 
}

function closePdfModal() { 
  const pdfModal = $('pdf-modal');
  if (pdfModal) {
    pdfModal.classList.remove('show');
    pdfModal.setAttribute('hidden', '');
  } 
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
  document.querySelectorAll('.mobile-nav-item').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));

  $('today-btn').addEventListener('click', () => {
    focusWeek = currentWeek();
    focusMonth = new Date(now().getFullYear(), now().getMonth(), 1);
    updateHeader();
    renderWeek();
    renderMonth();
  });

  $('prev-week').addEventListener('click', () => {
    focusWeek = clampWeek(focusWeek - 1);
    updateHeader();
    renderWeek();
  });
  $('next-week').addEventListener('click', () => {
    focusWeek = clampWeek(focusWeek + 1);
    updateHeader();
    renderWeek();
  });
  $('week-select').addEventListener('change', (e) => {
    focusWeek = clampWeek(Number(e.target.value));
    updateHeader();
    renderWeek();
  });

  $('prev-month').addEventListener('click', () => {
    focusMonth.setMonth(focusMonth.getMonth() - 1);
    renderMonth();
  });
  $('next-month').addEventListener('click', () => {
    focusMonth.setMonth(focusMonth.getMonth() + 1);
    renderMonth();
  });
  $('today-month').addEventListener('click', () => {
    focusMonth = new Date(now().getFullYear(), now().getMonth(), 1);
    renderMonth();
  });

  $('calendar').addEventListener('click', (e) => {
    const cell = e.target.closest('.calendar-cell');
    if (!cell || !cell.dataset.date) return;
    openNoteModal(cell.dataset.date);
  });

  $('week-board').addEventListener('click', (e) => {
    const noteSlot = e.target.closest('.note-slot');
    if (!noteSlot || !noteSlot.dataset.date) return;
    openNoteModal(noteSlot.dataset.date);
  });

  $('note-modal-close').addEventListener('click', closeNoteModal);
  $('note-modal-done').addEventListener('click', closeNoteModal);
  $('note-modal').addEventListener('click', (e) => {
    if (e.target === $('note-modal')) closeNoteModal();
  });
  $('note-add-form').addEventListener('submit', handleAddNote);

  const uploadPdfBtn = $('upload-pdf-btn');
  const pdfModal = $('pdf-modal');
  const pdfCloseBtn = $('pdf-modal-close');
  const pdfDoneBtn = $('pdf-modal-done');

  if (uploadPdfBtn) uploadPdfBtn.addEventListener('click', openPdfModal);
  if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfModal);
  if (pdfDoneBtn) pdfDoneBtn.addEventListener('click', closePdfModal);
  if (pdfModal) {
    pdfModal.addEventListener('click', (e) => {
      if (e.target === pdfModal) closePdfModal();
    });
  }

  const helpBtn = $('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      if (typeof startTour === 'function') startTour(true);
    });
  }

  const refCurrentBtn = $('ref-current-week-btn');
  if (refCurrentBtn) {
    refCurrentBtn.addEventListener('click', () => {
      focusWeek = currentWeek();
      showView('week');
    });
  }

  window.addEventListener('resize', () => {
    if (typeof updateMobileScheduleVisibility === 'function') {
      updateMobileScheduleVisibility();
    }
  }, { passive: true });
}

let swipeToastTimeout = null;
function showSwipeToast(message, direction) {
  let toast = $('swipe-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'swipe-toast';
    toast.className = 'swipe-indicator-toast';
    document.body.appendChild(toast);
  }
  const icon = direction === 'next' 
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>';
  
  toast.innerHTML = direction === 'next' 
    ? `<span>${escapeHtml(message)}</span> ${icon}`
    : `${icon} <span>${escapeHtml(message)}</span>`;
  
  toast.classList.add('show');
  if (swipeToastTimeout) clearTimeout(swipeToastTimeout);
  swipeToastTimeout = setTimeout(() => {
    if (toast) toast.classList.remove('show');
  }, 850);
}

function initSwipeGestures() {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isTouching = false;

  const appShell = document.querySelector('.app-shell') || document.body;

  appShell.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const target = e.target;
    // Don't trigger if interacting with form elements, buttons, modals, or picker
    if (target.closest('select, input, textarea, button, .modal, .class-dropdown, .calendar-cell, .week-note-pill')) {
      isTouching = false;
      return;
    }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
    isTouching = true;
  }, { passive: true });

  appShell.addEventListener('touchend', (e) => {
    if (!isTouching || e.changedTouches.length !== 1) return;
    isTouching = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const elapsed = Date.now() - startTime;

    // Must be primarily horizontal gesture, fast enough (< 500ms), and distance >= 45px
    if (elapsed < 500 && Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      if (activeView === 'week') {
        if (deltaX < 0) {
          // Swipe Left -> Next Week
          if (focusWeek < maxWeeks()) {
            focusWeek = clampWeek(focusWeek + 1);
            updateHeader();
            renderWeek();
            showSwipeToast(`Tuần ${focusWeek}`, 'next');
          } else {
            showSwipeToast(`Tuần ${focusWeek} (Tuần cuối)`, 'next');
          }
        } else {
          // Swipe Right -> Previous Week
          if (focusWeek > 1) {
            focusWeek = clampWeek(focusWeek - 1);
            updateHeader();
            renderWeek();
            showSwipeToast(`Tuần ${focusWeek}`, 'prev');
          } else {
            showSwipeToast(`Tuần 1 (Tuần đầu)`, 'prev');
          }
        }
      } else if (activeView === 'month') {
        if (deltaX < 0) {
          // Swipe Left -> Next Month
          focusMonth.setMonth(focusMonth.getMonth() + 1);
          renderMonth();
          showSwipeToast(`Tháng ${focusMonth.getMonth() + 1}/${focusMonth.getFullYear()}`, 'next');
        } else {
          // Swipe Right -> Prev Month
          focusMonth.setMonth(focusMonth.getMonth() - 1);
          renderMonth();
          showSwipeToast(`Tháng ${focusMonth.getMonth() + 1}/${focusMonth.getFullYear()}`, 'prev');
        }
      }
    }
  }, { passive: true });
}

function init() {
  try {
    localStorage.removeItem('tkb-schedule-v4');
    localStorage.removeItem('tkb-schedule-v3');
    localStorage.removeItem('tkb-schedule-v2');
    localStorage.removeItem('tkb-schedule-v1');

    const customDb = readStorage(STORAGE.customDatabase, null);
    if (customDb && typeof customDb === 'object' && Object.keys(customDb).length > 0) {
      window.ALL_CLASSES_DATABASE = customDb;
    }
  } catch (_) {}

  schedule = loadSchedule();
  initClassPicker();
  bindEvents();
  initPdfUpload();
  initSwipeGestures();
  updateHeader();
  updateClock();
  showView('week');
  renderWeek();
  renderMonth();
  setInterval(updateClock, 1000);

  // Auto-launch tour on first visit
  setTimeout(() => {
    if (typeof startTour === 'function') {
      startTour(false);
    }
  }, 450);
}

document.addEventListener('DOMContentLoaded', init);
