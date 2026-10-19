/**
 * TKB - Storage Service (LocalStorage CRUD)
 */
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_) { return fallback; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (_) { /* privacy mode / file:// */ }
}

function loadSettings() {
  const saved = readStorage(STORAGE.settings, {});
  return { ...DEFAULT_SETTINGS, ...saved, maxWeeks: clampInt(saved.maxWeeks ?? DEFAULT_SETTINGS.maxWeeks, 1, 60) };
}

function loadSchedule() {
  if (settings && settings.viewMode === 'teacher' && settings.teacherCode) {
    if (typeof ALL_TEACHERS_DATABASE === 'object' && ALL_TEACHERS_DATABASE && ALL_TEACHERS_DATABASE[settings.teacherCode]) {
      const tData = ALL_TEACHERS_DATABASE[settings.teacherCode];
      if (Array.isArray(tData.schedule) && tData.schedule.length) {
        return tData.schedule.map(normalizeScheduleRow);
      }
    }
  }
  const currentCode = (settings && settings.classCode) || 'CD25CNTT2';
  if (typeof ALL_CLASSES_DATABASE === 'object' && ALL_CLASSES_DATABASE && ALL_CLASSES_DATABASE[currentCode]) {
    const classData = ALL_CLASSES_DATABASE[currentCode];
    if (Array.isArray(classData.schedule) && classData.schedule.length) {
      return classData.schedule.map(normalizeScheduleRow);
    }
  }
  return [];
}

function loadNotes() {
  const saved = readStorage(STORAGE.notes, {});
  return (typeof saved === 'object' && saved !== null) ? saved : {};
}

function saveSettings() { writeStorage(STORAGE.settings, settings); }
function saveSchedule() { writeStorage(STORAGE.schedule, schedule); }
function saveNotes() { writeStorage(STORAGE.notes, notes); }
