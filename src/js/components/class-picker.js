/**
 * TKB - Searchable Class Picker Component
 */
let pickerFocusedIndex = -1;
let currentFilteredClasses = [];

function updateClassPickerButton(classCode) {
  const triggerText = $('class-picker-text');
  if (!triggerText) return;
  const currentCode = classCode || settings.classCode || 'CD25CNTT2';
  if (typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE && ALL_CLASSES_DATABASE[currentCode]) {
    const info = ALL_CLASSES_DATABASE[currentCode];
    triggerText.innerHTML = `<strong>${currentCode}</strong> · ${escapeHtml(info.major || info.name || '')}`;
  } else {
    triggerText.innerHTML = `<strong>${currentCode}</strong>`;
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

  if (input) {
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

  if (typeof ALL_CLASSES_DATABASE !== 'object' || !ALL_CLASSES_DATABASE) {
    listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy cơ sở dữ liệu lớp học</div>`;
    return;
  }

  const normQuery = removeVietnameseTones(query);
  const keys = Object.keys(ALL_CLASSES_DATABASE).sort();

  const filtered = keys.filter((k) => {
    if (!normQuery) return true;
    const info = ALL_CLASSES_DATABASE[k];
    const normCode = removeVietnameseTones(k);
    const normMajor = removeVietnameseTones(info.major || '');
    const normDept = removeVietnameseTones(info.dept || '');
    return normCode.includes(normQuery) || normMajor.includes(normQuery) || normDept.includes(normQuery);
  });

  currentFilteredClasses = filtered;
  pickerFocusedIndex = -1;

  if (countLabel) {
    countLabel.textContent = query ? `Đã tìm thấy ${filtered.length} / ${keys.length} lớp` : `${keys.length} lớp toàn trường`;
  }

  if (!filtered.length) {
    listContainer.innerHTML = `<div class="picker-empty-state">Không tìm thấy lớp học nào khớp với "<strong>${escapeHtml(query)}</strong>"</div>`;
    return;
  }

  const k25 = [], k24 = [], t25 = [], others = [];
  filtered.forEach((k) => {
    if (k.startsWith('CD25')) k25.push(k);
    else if (k.startsWith('CD24')) k24.push(k);
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
      const isSelected = c === settings.classCode;
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

  html += renderGroup('Cao Đẳng · Khóa 2025 (K25)', k25);
  html += renderGroup('Cao Đẳng · Khóa 2024 (K24)', k24);
  html += renderGroup('Trung Cấp · Khóa 2025 (T25)', t25);
  html += renderGroup('Khác', others);

  listContainer.innerHTML = html;

  listContainer.querySelectorAll('.picker-item').forEach((item) => {
    item.addEventListener('click', () => {
      const c = item.getAttribute('data-class');
      if (c) selectClass(c);
    });
  });
}

function selectClass(classCode) {
  switchClass(classCode);
  updateClassPickerButton(classCode);
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

  updateClassPickerButton(settings.classCode);

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
        if (pickerFocusedIndex >= 0 && pickerFocusedIndex < items.length) {
          const c = items[pickerFocusedIndex].getAttribute('data-class');
          if (c) selectClass(c);
        } else if (items.length > 0) {
          const c = items[0].getAttribute('data-class');
          if (c) selectClass(c);
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
