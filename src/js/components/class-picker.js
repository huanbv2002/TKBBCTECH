/**
 * TKB - Searchable Class & Teacher Picker Component
 */
let pickerFocusedIndex = -1;
let currentFilteredItems = [];
let currentPickerType = 'class';

function updateClassPickerButton(code) {
  const triggerText = $('class-picker-text');
  if (!triggerText) return;

  if (settings && settings.viewMode === 'teacher' && settings.teacherCode) {
    const tCode = settings.teacherCode;
    if (typeof ALL_TEACHERS_DATABASE === 'object' && ALL_TEACHERS_DATABASE && ALL_TEACHERS_DATABASE[tCode]) {
      const info = ALL_TEACHERS_DATABASE[tCode];
      triggerText.innerHTML = `<strong>${escapeHtml(info.name)}</strong> · ${escapeHtml(info.dept || info.code || 'Giảng viên')}`;
      return;
    }
    triggerText.innerHTML = `<strong>${escapeHtml(tCode)}</strong> · Giảng viên`;
    return;
  }

  const currentCode = code || (settings && settings.classCode) || 'CD25CNTT2';
  if (typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE && ALL_CLASSES_DATABASE[currentCode]) {
    const info = ALL_CLASSES_DATABASE[currentCode];
    triggerText.innerHTML = `<strong>${currentCode}</strong> · ${escapeHtml(info.major || info.name || '')}`;
  } else {
    triggerText.innerHTML = `<strong>${currentCode}</strong>`;
  }
}

function setPickerType(type) {
  currentPickerType = type;
  const tabClass = $('picker-tab-class');
  const tabTeacher = $('picker-tab-teacher');
  const input = $('class-search-input');
  if (tabClass) tabClass.classList.toggle('active', type === 'class');
  if (tabTeacher) tabTeacher.classList.toggle('active', type === 'teacher');
  if (input) {
    input.placeholder = type === 'teacher' 
      ? 'Gõ tên giảng viên hoặc mã (vd: Minh, Thu, Khoa, Hà, BCTECH...)'
      : 'Gõ tên lớp hoặc ngành học (vd: CNTT, Ô tô, May, Điện...)';
    input.value = '';
    renderClassPickerOptions('');
    input.focus();
  }
}

function openClassPicker() {
  const wrapper = $('class-picker-wrapper');
  const dropdown = $('class-picker-dropdown');
  const trigger = $('class-picker-trigger');
  const input = $('class-search-input');
  if (!wrapper || !dropdown) return;

  wrapper.classList.add('is-open');
  dropdown.hidden = false;
  if (trigger) trigger.setAttribute('aria-expanded', 'true');

  currentPickerType = (settings && settings.viewMode === 'teacher') ? 'teacher' : 'class';
  const tabClass = $('picker-tab-class');
  const tabTeacher = $('picker-tab-teacher');
  if (tabClass) tabClass.classList.toggle('active', currentPickerType === 'class');
  if (tabTeacher) tabTeacher.classList.toggle('active', currentPickerType === 'teacher');

  if (input) {
    input.placeholder = currentPickerType === 'teacher'
      ? 'Gõ tên giảng viên hoặc mã (vd: Minh, Thu, Khoa, Hà, BCTECH...)'
      : 'Gõ tên lớp hoặc ngành học (vd: CNTT, Ô tô, May, Điện...)';
    input.value = '';
    renderClassPickerOptions('');
    setTimeout(() => {
      input.focus();
      input.select();
    }, 50);
  }
}

function closeClassPicker() {
  const wrapper = $('class-picker-wrapper');
  const dropdown = $('class-picker-dropdown');
  const trigger = $('class-picker-trigger');
  if (!wrapper || !dropdown) return;

  wrapper.classList.remove('is-open');
  dropdown.hidden = true;
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  pickerFocusedIndex = -1;
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const rawText = String(text || '');
  const normText = removeVietnameseTones(rawText);
  const normQuery = removeVietnameseTones(query);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return escapeHtml(rawText);

  const before = rawText.slice(0, idx);
  const match = rawText.slice(idx, idx + query.length);
  const after = rawText.slice(idx + query.length);
  return `${escapeHtml(before)}<span class="picker-highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
}

function renderClassPickerOptions(filterText = '') {
  const listContainer = $('picker-options-list');
  const countLabel = $('picker-count-label');
  const clearBtn = $('picker-clear-btn');
  if (!listContainer) return;

  const query = filterText.trim();
  if (clearBtn) clearBtn.hidden = !query;
  const normQuery = removeVietnameseTones(query);

  // 1. Chế độ Giảng viên
  if (currentPickerType === 'teacher') {
    if (typeof ALL_TEACHERS_DATABASE !== 'object' || !ALL_TEACHERS_DATABASE) {
      listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy cơ sở dữ liệu giảng viên</div>`;
      return;
    }

    const keys = Object.keys(ALL_TEACHERS_DATABASE);
    const filtered = keys.filter((k) => {
      if (!normQuery) return true;
      const info = ALL_TEACHERS_DATABASE[k];
      const normName = removeVietnameseTones(info.name || '');
      const normCode = removeVietnameseTones(info.code || k);
      const normDept = removeVietnameseTones(info.dept || '');
      return normName.includes(normQuery) || normCode.includes(normQuery) || normDept.includes(normQuery);
    });

    currentFilteredItems = filtered;
    pickerFocusedIndex = -1;

    if (countLabel) {
      countLabel.textContent = query ? `Đã tìm thấy ${filtered.length} / ${keys.length} giảng viên` : `${keys.length} giảng viên toàn trường`;
    }

    if (!filtered.length) {
      listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy giảng viên nào khớp với "<strong>${escapeHtml(query)}</strong>"</div>`;
      return;
    }

    // Nhóm theo Đơn vị / Khoa
    const deptGroups = {};
    filtered.forEach((k) => {
      const info = ALL_TEACHERS_DATABASE[k];
      const d = (info.dept || 'Khác').trim();
      if (!deptGroups[d]) deptGroups[d] = [];
      deptGroups[d].push(k);
    });

    let html = '';
    let globalItemIndex = 0;

    Object.keys(deptGroups).sort().forEach((deptName) => {
      const tKeys = deptGroups[deptName];
      html += `<div class="picker-group-heading">${escapeHtml(deptName)} (${tKeys.length})</div>`;
      tKeys.forEach((k) => {
        const info = ALL_TEACHERS_DATABASE[k];
        const isSelected = settings && settings.viewMode === 'teacher' && settings.teacherCode === k;
        const nameHtml = highlightMatch(info.name || k, query);
        const codeHtml = highlightMatch(info.code || k, query);
        const itemIndex = globalItemIndex++;

        html += `
          <div class="picker-item ${isSelected ? 'is-selected' : ''}" 
               data-teacher="${k}" 
               data-index="${itemIndex}"
               role="option" 
               aria-selected="${isSelected ? 'true' : 'false'}">
            <div class="picker-item-left">
              <span class="picker-item-code">${nameHtml}</span>
              <span class="picker-item-major">Mã: ${codeHtml} · ${info.schedule ? info.schedule.length : 0} môn/lớp</span>
            </div>
            <div class="picker-item-check" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        `;
      });
    });

    listContainer.innerHTML = html;
    listContainer.querySelectorAll('.picker-item[data-teacher]').forEach((item) => {
      item.addEventListener('click', () => {
        const t = item.getAttribute('data-teacher');
        if (t) selectTeacher(t);
      });
    });
    return;
  }

  // 2. Chế độ Học sinh / Lớp học
  if (typeof ALL_CLASSES_DATABASE !== 'object' || !ALL_CLASSES_DATABASE) {
    listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy cơ sở dữ liệu lớp học</div>`;
    return;
  }

  const keys = Object.keys(ALL_CLASSES_DATABASE).sort();
  const filtered = keys.filter((k) => {
    if (!normQuery) return true;
    const info = ALL_CLASSES_DATABASE[k];
    const normCode = removeVietnameseTones(k);
    const normMajor = removeVietnameseTones(info.major || '');
    const normDept = removeVietnameseTones(info.dept || '');
    return normCode.includes(normQuery) || normMajor.includes(normQuery) || normDept.includes(normQuery);
  });

  currentFilteredItems = filtered;
  pickerFocusedIndex = -1;

  if (countLabel) {
    countLabel.textContent = query ? `Đã tìm thấy ${filtered.length} / ${keys.length} lớp` : `${keys.length} lớp toàn trường`;
  }

  if (!filtered.length) {
    listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy lớp học nào khớp với "<strong>${escapeHtml(query)}</strong>"</div>`;
    return;
  }

  const cd26 = [], cd25 = [], cd24 = [], t26 = [], t25 = [], vh = [], others = [];
  filtered.forEach((k) => {
    if (k.startsWith('CD26')) cd26.push(k);
    else if (k.startsWith('CD25')) cd25.push(k);
    else if (k.startsWith('CD24')) cd24.push(k);
    else if (k.includes('VH')) vh.push(k);
    else if (k.startsWith('T26')) t26.push(k);
    else if (k.startsWith('T25')) t25.push(k);
    else others.push(k);
  });

  let html = '';
  let globalItemIndex = 0;

  function renderGroup(title, groupKeys) {
    if (!groupKeys.length) return '';
    let gHtml = `<div class="picker-group-heading">${title} (${groupKeys.length})</div>`;
    groupKeys.forEach((c) => {
      const info = ALL_CLASSES_DATABASE[c];
      const isSelected = (!settings.viewMode || settings.viewMode === 'class') && c === settings.classCode;
      const codeHtml = highlightMatch(c, query);
      const majorHtml = highlightMatch(info.major || '', query);
      const itemIndex = globalItemIndex++;

      gHtml += `
        <div class="picker-item ${isSelected ? 'is-selected' : ''}" 
             data-class="${c}" 
             data-index="${itemIndex}"
             role="option" 
             aria-selected="${isSelected ? 'true' : 'false'}">
          <div class="picker-item-left">
            <span class="picker-item-code">${codeHtml}</span>
            <span class="picker-item-major" title="${escapeHtml(info.major || '')}">${majorHtml}</span>
          </div>
          <div class="picker-item-check" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      `;
    });
    return gHtml;
  }

  html += renderGroup('Trung Cấp · Khóa 2026 (T26 - Kèm Văn Hóa)', t26);
  html += renderGroup('Cao Đẳng · Khóa 2026 (CD26)', cd26);
  html += renderGroup('Cao Đẳng · Khóa 2025 (CD25)', cd25);
  html += renderGroup('Trung Cấp · Khóa 2025 (T25)', t25);
  html += renderGroup('Cao Đẳng · Khóa 2024 (CD24)', cd24);
  html += renderGroup('Lớp Văn Hóa THPT (T25VH / T26VH)', vh);
  html += renderGroup('Khác', others);

  listContainer.innerHTML = html;

  listContainer.querySelectorAll('.picker-item[data-class]').forEach((item) => {
    item.addEventListener('click', () => {
      const c = item.getAttribute('data-class');
      if (c) selectClass(c);
    });
  });
}

function selectClass(classCode) {
  if (typeof switchClass === 'function') switchClass(classCode);
  updateClassPickerButton(classCode);
  closeClassPicker();
}

function selectTeacher(teacherCode) {
  if (typeof switchTeacher === 'function') switchTeacher(teacherCode);
  updateClassPickerButton();
  closeClassPicker();
}

function updatePickerFocus(items) {
  items.forEach((it, idx) => {
    if (idx === pickerFocusedIndex) {
      it.classList.add('is-focused');
      it.scrollIntoView({ block: 'nearest' });
    } else {
      it.classList.remove('is-focused');
    }
  });
}

function initClassPicker() {
  const trigger = $('class-picker-trigger');
  const input = $('class-search-input');
  const clearBtn = $('picker-clear-btn');
  const listContainer = $('picker-options-list');
  const tabClass = $('picker-tab-class');
  const tabTeacher = $('picker-tab-teacher');

  updateClassPickerButton();

  if (tabClass) {
    tabClass.addEventListener('click', (e) => {
      e.stopPropagation();
      setPickerType('class');
    });
  }

  if (tabTeacher) {
    tabTeacher.addEventListener('click', (e) => {
      e.stopPropagation();
      setPickerType('teacher');
    });
  }

  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = $('class-picker-wrapper');
      if (wrapper && wrapper.classList.contains('is-open')) {
        closeClassPicker();
      } else {
        openClassPicker();
      }
    });
  }

  if (input) {
    input.addEventListener('input', (e) => {
      renderClassPickerOptions(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = listContainer ? listContainer.querySelectorAll('.picker-item') : [];
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        pickerFocusedIndex = (pickerFocusedIndex + 1) % items.length;
        updatePickerFocus(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        pickerFocusedIndex = (pickerFocusedIndex - 1 + items.length) % items.length;
        updatePickerFocus(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = (pickerFocusedIndex >= 0 && pickerFocusedIndex < items.length) ? items[pickerFocusedIndex] : items[0];
        if (activeItem) {
          const c = activeItem.getAttribute('data-class');
          const t = activeItem.getAttribute('data-teacher');
          if (c) selectClass(c);
          else if (t) selectTeacher(t);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeClassPicker();
        if (trigger) trigger.focus();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (input) {
        input.value = '';
        renderClassPickerOptions('');
        input.focus();
      }
    });
  }

  document.addEventListener('click', (e) => {
    const wrapper = $('class-picker-wrapper');
    if (wrapper && wrapper.classList.contains('is-open') && !wrapper.contains(e.target)) {
      closeClassPicker();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName))) {
      e.preventDefault();
      openClassPicker();
    } else if (e.key === 'Escape') {
      closeClassPicker();
    }
  });
}
