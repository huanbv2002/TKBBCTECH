/**
 * TKB - Note Modal View & Interaction
 */
function openNoteModal(dateKey) {
  activeModalDateStr = dateKey;
  const parts = dateKey.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const holiday = getHolidayForDate(dateKey);
  
  $('note-modal-title').textContent = `${fullDay(schoolDayForDate(date))}, ngày ${parts[2]}/${parts[1]}/${parts[0]}`;
  
  const week = weekForDate(date);
  const items = week >= 1 && week <= maxWeeks() ? schedule.filter((item) => item.dow === schoolDayForDate(date) && item.weeks.includes(week)) : [];
  
  let classesHtml = '';
  if (holiday) {
    classesHtml += `
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px; margin-bottom:12px; color:#991b1b; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span><b>LƯU Ý NGHỈ LỄ/TẾT:</b> ${escapeHtml(holiday.name)} — ${escapeHtml(holiday.note)}</span>
      </div>
    `;
  }

  if (items.length) {
    classesHtml += items.map((item) => `
      <div class="modal-day-class-card ${holiday ? 'holiday-cancelled' : ''}">
        <strong>${escapeHtml(item.subject)}</strong>
        <span>${escapeHtml(periodLabel(item.periods))} (${escapeHtml(displayTime(item.periods))}) · Phòng <b>${escapeHtml(item.room)}</b> · ${escapeHtml(item.teacher || 'Chưa có GV')}</span>
        ${holiday ? `<span class="event-holiday-tag" style="margin-top:4px;">Nghỉ Lễ Toàn Trường: ${escapeHtml(holiday.name)}</span>` : ''}
      </div>
    `).join('');
  } else {
    classesHtml += `<div style="color: var(--muted); font-size: 12px;">${holiday ? 'Ngày nghỉ lễ, không có tiết học.' : 'Không có lịch học trên lớp.'}</div>`;
  }
  
  $('modal-day-classes-list').innerHTML = classesHtml;

  renderModalNotesList();
  $('note-input-text').value = '';
  const modal = $('note-modal');
  modal.removeAttribute('hidden');
  modal.classList.add('show');
  setTimeout(() => $('note-input-text').focus(), 50);
}

function closeNoteModal() {
  const modal = $('note-modal');
  modal.classList.remove('show');
  modal.setAttribute('hidden', '');
  activeModalDateStr = null;
  renderWeek();
  renderMonth();
}

function renderModalNotesList() {
  if (!activeModalDateStr) return;
  const dayNotes = notes[activeModalDateStr] || [];
  if (!dayNotes.length) {
    $('modal-notes-list').innerHTML = '<div style="color: var(--muted); font-size: 12.5px; padding: 4px 0;">Chưa có ghi chú nào cho ngày này.</div>';
    return;
  }
  $('modal-notes-list').innerHTML = dayNotes.map((noteText, idx) => `
    <div class="note-item">
      <span>${escapeHtml(noteText)}</span>
      <button class="note-delete-btn" onclick="deleteNote(${idx})" title="Xóa ghi chú này">
        ${TRASH_ICON_SVG}
        <span>Xóa</span>
      </button>
    </div>
  `).join('');
}

window.deleteNote = function(index) {
  if (!activeModalDateStr || !notes[activeModalDateStr]) return;
  notes[activeModalDateStr].splice(index, 1);
  if (!notes[activeModalDateStr].length) delete notes[activeModalDateStr];
  saveNotes();
  renderModalNotesList();
  renderWeek();
  renderMonth();
};

function handleAddNote(e) {
  e.preventDefault();
  if (!activeModalDateStr) return;
  const text = cleanText($('note-input-text').value);
  if (!text) return;
  if (!notes[activeModalDateStr]) notes[activeModalDateStr] = [];
  notes[activeModalDateStr].push(text);
  saveNotes();
  $('note-input-text').value = '';
  renderModalNotesList();
  renderWeek();
  renderMonth();
}
