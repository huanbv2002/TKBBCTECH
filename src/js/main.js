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
