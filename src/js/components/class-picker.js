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
      triggerText.innerHTML = `<span class="picker-trigger-name">${escapeHtml(info.name)}</span><span class="picker-trigger-sub"> · Giảng viên</span>`;
      return;
    }
    triggerText.innerHTML = `<span class="picker-trigger-name">${escapeHtml(tCode)}</span><span class="picker-trigger-sub"> · Giảng viên</span>`;
    return;
  }

  const currentCode = code || (settings && settings.classCode) || 'CD25CNTT2';
  if (typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE && ALL_CLASSES_DATABASE[currentCode]) {
    const info = ALL_CLASSES_DATABASE[currentCode];
    triggerText.innerHTML = `<span class="picker-trigger-name">${currentCode}</span><span class="picker-trigger-sub"> · ${escapeHtml(info.major || info.name || '')}</span>`;
  } else {
    triggerText.innerHTML = `<span class="picker-trigger-name">${currentCode}</span>`;
  }
}

function setPickerType(type, keepQuery = false) {
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
    if (!keepQuery) {
      input.value = '';
      renderClassPickerOptions('');
    } else {
      renderClassPickerOptions(input.value);
    }
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

function getVietnameseSortKey(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const firstName = parts[parts.length - 1];
  const remaining = parts.slice(0, parts.length - 1).join(' ');
  return `${firstName} ${remaining}`;
}

function getTeacherStats(teacherInfo) {
  if (!teacherInfo || !teacherInfo.schedule) return { subjects: 0, classes: 0, label: '0 môn' };
  const subjects = new Set();
  const classes = new Set();
  teacherInfo.schedule.forEach((s) => {
    if (s.subject) subjects.add(s.subject.trim());
    if (s.className) classes.add(s.className.trim());
  });
  const subjCount = subjects.size;
  const classCount = classes.size;
  const subjList = [...subjects].join(', ');
  return {
    subjects: subjCount,
    classes: classCount,
    subjList: subjList,
    label: `${subjCount} môn · ${classCount} lớp`
  };
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
      return normName.includes(normQuery) || normCode.includes(normQuery);
    });

    currentFilteredItems = filtered;
    pickerFocusedIndex = -1;

    if (countLabel) {
      countLabel.textContent = query ? `Đã tìm thấy ${filtered.length} / ${keys.length} giảng viên` : `${keys.length} giảng viên toàn trường`;
    }

    if (!filtered.length) {
      let crossHtml = '';
      if (normQuery && typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE) {
        const classKeys = Object.keys(ALL_CLASSES_DATABASE);
        const matchingClasses = classKeys.filter((c) => {
          const info = ALL_CLASSES_DATABASE[c];
          const normC = removeVietnameseTones(c);
          const normM = removeVietnameseTones(info.major || '');
          const normD = removeVietnameseTones(info.dept || '');
          return normC.includes(normQuery) || normM.includes(normQuery) || normD.includes(normQuery);
        });

        if (matchingClasses.length > 0) {
          const previewClasses = matchingClasses.slice(0, 5);
          crossHtml = `
            <div class="picker-cross-hint">
              <div class="cross-hint-title">Bạn đang tìm lớp học?</div>
              <div class="cross-hint-sub">Tìm thấy ${matchingClasses.length} lớp học phù hợp ở mục <strong>Học sinh / Lớp</strong>:</div>
              <div class="picker-cross-list">
                ${previewClasses.map((c) => {
                  const info = ALL_CLASSES_DATABASE[c];
                  return `
                    <div class="picker-item picker-class-item is-cross-match" data-cross-class="${c}">
                      <div class="picker-item-left">
                        <span class="picker-item-code">${c}</span>
                        <span class="picker-item-major">${escapeHtml(info.major || '')}</span>
                      </div>
                      <span class="picker-cross-btn">Xem lịch lớp</span>
                    </div>
                  `;
                }).join('')}
              </div>
              <button type="button" class="picker-switch-tab-btn" id="btn-switch-to-class">
                Chuyển sang tìm theo Lớp (${matchingClasses.length} kết quả)
              </button>
            </div>
          `;
        }
      }

      listContainer.innerHTML = `
        <div class="picker-empty-state">Không tìm thấy giảng viên nào khớp với "<strong>${escapeHtml(query)}</strong>"</div>
        ${crossHtml}
      `;

      listContainer.querySelectorAll('[data-cross-class]').forEach((el) => {
        el.addEventListener('click', () => {
          const c = el.getAttribute('data-cross-class');
          if (c) selectClass(c);
        });
      });
      const btnSwitch = $('btn-switch-to-class');
      if (btnSwitch) {
        btnSwitch.addEventListener('click', () => {
          setPickerType('class', true);
        });
      }
      return;
    }

    // Sắp xếp danh sách giảng viên theo Tên (A - Z chuẩn Tiếng Việt)
    filtered.sort((a, b) => {
      const nameA = (ALL_TEACHERS_DATABASE[a]?.name || a).trim();
      const nameB = (ALL_TEACHERS_DATABASE[b]?.name || b).trim();
      const keyA = getVietnameseSortKey(nameA);
      const keyB = getVietnameseSortKey(nameB);
      return keyA.localeCompare(keyB, 'vi');
    });

    let html = '';
    let globalItemIndex = 0;

    if (normQuery && typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE) {
      const classKeys = Object.keys(ALL_CLASSES_DATABASE);
      const matchClassesCount = classKeys.filter((c) => {
        const info = ALL_CLASSES_DATABASE[c];
        return removeVietnameseTones(c).includes(normQuery) || removeVietnameseTones(info.major || '').includes(normQuery);
      }).length;
      if (matchClassesCount > 0) {
        html += `
          <div class="picker-switch-hint">
            <span>Tìm thấy thêm <strong>${matchClassesCount} lớp học</strong> khớp từ khóa.</span>
            <button type="button" class="picker-switch-link" id="link-switch-to-class">Xem lớp &rarr;</button>
          </div>
        `;
      }
    }

    filtered.forEach((k) => {
      const info = ALL_TEACHERS_DATABASE[k];
      const isSelected = settings && settings.viewMode === 'teacher' && settings.teacherCode === k;
      const nameHtml = highlightMatch(info.name || k, query);
      const codeHtml = highlightMatch(info.code || k, query);
      const stats = getTeacherStats(info);
      const itemIndex = globalItemIndex++;

      html += `
        <div class="picker-item picker-teacher-item ${isSelected ? 'is-selected' : ''}" 
             data-teacher="${k}" 
             data-index="${itemIndex}"
             role="option" 
             aria-selected="${isSelected ? 'true' : 'false'}">
          <div class="picker-item-left">
            <span class="picker-item-code">${nameHtml}</span>
            <span class="picker-item-major" title="${escapeHtml(stats.subjList)}">Mã: ${codeHtml} · ${stats.label}</span>
          </div>
          <div class="picker-item-check" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
    listContainer.querySelectorAll('.picker-item[data-teacher]').forEach((item) => {
      item.addEventListener('click', () => {
        const t = item.getAttribute('data-teacher');
        if (t) selectTeacher(t);
      });
    });
    const linkSwitch = $('link-switch-to-class');
    if (linkSwitch) {
      linkSwitch.addEventListener('click', () => {
        setPickerType('class', true);
      });
    }
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
    let crossHtml = '';
    if (normQuery && typeof ALL_TEACHERS_DATABASE === 'object' && ALL_TEACHERS_DATABASE) {
      const teacherKeys = Object.keys(ALL_TEACHERS_DATABASE);
      const matchingTeachers = teacherKeys.filter((k) => {
        const info = ALL_TEACHERS_DATABASE[k];
        const normName = removeVietnameseTones(info.name || '');
        const normCode = removeVietnameseTones(info.code || k);
        return normName.includes(normQuery) || normCode.includes(normQuery);
      });

      if (matchingTeachers.length > 0) {
        const previewTeachers = matchingTeachers.slice(0, 5);
        crossHtml = `
          <div class="picker-cross-hint">
            <div class="cross-hint-title">Bạn đang tìm giảng viên?</div>
            <div class="cross-hint-sub">Tìm thấy ${matchingTeachers.length} giảng viên phù hợp ở mục <strong>Giảng viên</strong>:</div>
            <div class="picker-cross-list">
              ${previewTeachers.map((k) => {
                const info = ALL_TEACHERS_DATABASE[k];
                const stats = getTeacherStats(info);
                return `
                  <div class="picker-item picker-teacher-item is-cross-match" data-cross-teacher="${k}">
                    <div class="picker-item-left">
                      <span class="picker-item-code">${escapeHtml(info.name || k)}</span>
                      <span class="picker-item-major" title="${escapeHtml(stats.subjList)}">Mã: ${escapeHtml(info.code || k)} · ${stats.label}</span>
                    </div>
                    <span class="picker-cross-btn">Xem lịch dạy</span>
                  </div>
                `;
              }).join('')}
            </div>
            <button type="button" class="picker-switch-tab-btn" id="btn-switch-to-teacher">
              Chuyển sang tìm theo Giảng viên (${matchingTeachers.length} kết quả)
            </button>
          </div>
        `;
      }
    }

    listContainer.innerHTML = `
      <div class="picker-empty-state">Không tìm thấy lớp học nào khớp với "<strong>${escapeHtml(query)}</strong>"</div>
      ${crossHtml}
    `;

    listContainer.querySelectorAll('[data-cross-teacher]').forEach((el) => {
      el.addEventListener('click', () => {
        const t = el.getAttribute('data-cross-teacher');
        if (t) selectTeacher(t);
      });
    });
    const btnSwitchTeacher = $('btn-switch-to-teacher');
    if (btnSwitchTeacher) {
      btnSwitchTeacher.addEventListener('click', () => {
        setPickerType('teacher', true);
      });
    }
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

  if (normQuery && typeof ALL_TEACHERS_DATABASE === 'object' && ALL_TEACHERS_DATABASE) {
    const teacherKeys = Object.keys(ALL_TEACHERS_DATABASE);
    const matchTeachersCount = teacherKeys.filter((k) => {
      const info = ALL_TEACHERS_DATABASE[k];
      return removeVietnameseTones(info.name || '').includes(normQuery) || 
             removeVietnameseTones(info.code || k).includes(normQuery);
    }).length;
    if (matchTeachersCount > 0) {
      html += `
        <div class="picker-switch-hint">
          <span>Tìm thấy thêm <strong>${matchTeachersCount} giảng viên</strong> khớp từ khóa.</span>
          <button type="button" class="picker-switch-link" id="link-switch-to-teacher">Xem giảng viên &rarr;</button>
        </div>
      `;
    }
  }

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
        <div class="picker-item picker-class-item ${isSelected ? 'is-selected' : ''}" 
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

  const linkSwitchTeacher = $('link-switch-to-teacher');
  if (linkSwitchTeacher) {
    linkSwitchTeacher.addEventListener('click', () => {
      setPickerType('teacher', true);
    });
  }
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
  const mobileCloseBtn = $('picker-mobile-close');

  updateClassPickerButton();

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeClassPicker();
    });
  }

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
