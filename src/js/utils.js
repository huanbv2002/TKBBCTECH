/**
 * TKB - Utilities (Date, Formatters, Normalizers, Color Mappings)
 */
function $(id) { return document.getElementById(id); }

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function clampInt(value, min, max) { return Math.max(min, Math.min(max, Number.parseInt(value, 10) || min)); }
function now() { return new Date(); }

function parseDateInput(value) {
  const parts = String(value || '').split('-').map(Number);
  if (parts.length !== 3 || !parts.every(Boolean)) return new Date(2026, 8, 7);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function dateOnly(value) {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateKey(date) {
  const d = dateOnly(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function semesterStart() { return parseDateInput(settings.semesterStart); }
function maxWeeks() { return clampInt(settings.maxWeeks, 1, 60); }
function currentWeek() { return clampWeek(weekForDate(now())); }
function clampWeek(week) { return Math.max(1, Math.min(maxWeeks(), Number(week) || 1)); }

function weekForDate(value) {
  const diff = dateOnly(value).getTime() - semesterStart().getTime();
  return Math.floor(diff / 86400000 / 7) + 1;
}

function schoolDayForDate(value) {
  const jsDay = dateOnly(value).getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

function shortDay(dow) { return dow === 8 ? 'CN' : `T${dow}`; }
function fullDay(dow) { return dow === 8 ? 'Chủ nhật' : fullDays[dow - 1]; }

function dateAt(week, dow) {
  const monday = semesterStart();
  monday.setDate(monday.getDate() + (clampWeek(week) - 1) * 7);
  monday.setDate(monday.getDate() + (dow === 8 ? 6 : dow - 2));
  return monday;
}

function formatDate(value, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  return new Intl.DateTimeFormat('vi-VN', options).format(value);
}

function timeToMinutes(value) {
  const parts = String(value).split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }

function removeVietnameseTones(str) {
  str = String(str || '').toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/đ/g, 'd');
  return str;
}

function removeDiacritics(value) { return removeVietnameseTones(value); }

function colorForSubject(subject) {
  const text = removeVietnameseTones(String(subject || ''));
  if (text.includes('sinh hoat lop') || text.includes('shl')) return 'rose';
  if (text.includes('tieng anh') || text.includes('english')) return 'orange';
  if (text.includes('tin hoc')) return 'emerald';
  if (text.includes('thiet ke web') || text.includes('web')) return 'violet';
  if (text.includes('hoat hinh') || text.includes('flash')) return 'teal';
  if (text.includes('windows form') || text.includes('winform') || text.includes('lap trinh')) return 'blue';
  
  const palette = ['blue', 'teal', 'violet', 'emerald', 'orange', 'rose'];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % palette.length;
  return palette[hash];
}

function makeId() {
  try { return crypto.randomUUID(); }
  catch (_) { return 'row-' + Date.now() + '-' + Math.random().toString(16).slice(2); }
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function normalizePeriods(value) {
  const source = Array.isArray(value) ? value : parsePeriods(String(value || ''));
  return [...new Set(source.map(Number).filter((item) => Number.isInteger(item) && item >= 1 && item <= 14))].sort((a, b) => a - b);
}

function normalizeRoom(value) {
  let text = cleanText(value).toUpperCase().replace(/[|]/g, 'I');
  text = text.replace(/P\s*\.?\s*ONLINE/g, 'P.ONLINE').replace(/\s*\.\s*/g, '.').replace(/\s*\(\s*/g, ' (').replace(/\s*\)\s*/g, ')').replace(/\bLAB\s*(\d+)\b/g, 'LAB$1');
  if (/P\.ONLINE/.test(text)) return 'P.ONLINE';
  const match = text.match(/\b\d[A-Z]\s*\.\s*\d{3}(?:\s*\(LAB\d+\))?/i);
  return match ? match[0].replace(/\s+/g, ' ').trim() : text;
}

function normalizeCode(value) { return cleanText(value).toUpperCase().replace(/\s+/g, '').replace(/[|]/g, 'I'); }

function normalizeScheduleRow(item) {
  const dow = Number(item.dow);
  return {
    id: item.id || makeId(),
    code: normalizeCode(item.code),
    subject: cleanText(item.subject),
    teacher: cleanText(item.teacher),
    dow: Number.isInteger(dow) ? dow : 0,
    periods: normalizePeriods(item.periods || item.period || ''),
    room: normalizeRoom(item.room),
    weeks: normalizeWeeks(item.weeks || item.week || ''),
    color: item.color || colorForSubject(item.subject),
    confidence: Number(item.confidence ?? 100),
    source: item.source || 'import',
    errors: [],
    selected: item.selected !== false
  };
}

function normalizeWeeks(value) {
  const source = Array.isArray(value) ? value : parseWeeks(String(value || ''), maxWeeks());
  return [...new Set(source.map(Number).filter((item) => Number.isInteger(item) && item >= 1 && item <= maxWeeks()))].sort((a, b) => a - b);
}

function parsePeriods(text) {
  let raw = String(text || '').trim().toUpperCase().replace(/[IL|]/g, '1').replace(/[OS]/g, '0').replace(/[–—]/g, '-');
  const rangeMatch = raw.match(/\b(\d+)\s*-\s*(\d+)\b/);
  if (rangeMatch) {
    const s = Number(rangeMatch[1]);
    const e = Number(rangeMatch[2]);
    if (s >= 1 && e <= 14 && s <= e) return range(s, e);
  }
  const multiDigits = [...raw.matchAll(/\b(1[0-4]|[1-9])\b/g)].map((m) => Number(m[1]));
  if (multiDigits.length > 0 && multiDigits.some((n) => n >= 10)) {
    return [...new Set(multiDigits)].sort((a, b) => a - b);
  }
  if (/[-.·_~ ]/.test(raw) && raw.length >= 8) {
    const leadingNonDigits = (raw.match(/^[-.·_~ ]+/) || [''])[0].length;
    if (leadingNonDigits >= 9 && /[1-4]/.test(raw)) {
      const eveningPeriods = [];
      for (const ch of raw.slice(leadingNonDigits)) {
        if (ch === '1') eveningPeriods.push(11);
        else if (ch === '2') eveningPeriods.push(12);
        else if (ch === '3') eveningPeriods.push(13);
        else if (ch === '4') eveningPeriods.push(14);
      }
      if (eveningPeriods.length) return [...new Set(eveningPeriods)].sort((a, b) => a - b);
    }
    if (leadingNonDigits >= 8 && raw.includes('0')) return [10];
  }
  const values = new Set();
  for (const char of raw) {
    if (!/\d/.test(char)) continue;
    const number = Number(char) === 0 ? 10 : Number(char);
    if (number >= 1 && number <= 14) values.add(number);
  }
  return [...values].sort((a, b) => a - b);
}

function parseWeeks(text, limit = maxWeeks()) {
  const raw = String(text || '');
  const str = raw.trim();
  if (!str) return [];
  if (str.includes(',') || /\b(1\d|2\d|\d+)\s*-\s*(1\d|2\d|\d+)\b/.test(str) || /\b(1[0-9]|20)\b/.test(str)) {
    const values = new Set();
    for (const match of str.matchAll(/(\d+)\s*-\s*(\d+)/g)) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start <= end) {
        for (let i = start; i <= Math.min(end, limit); i++) values.add(i);
      }
    }
    const cleaned = str.replace(/(\d+)\s*-\s*(\d+)/g, ' ');
    const numTokens = cleaned.match(/\b\d+\b/g) || [];
    for (const token of numTokens) {
      const val = Number(token);
      if (val >= 1 && val <= limit) values.add(val);
    }
    if (values.size > 0) return [...values].sort((a, b) => a - b);
  }
  if (raw.length >= 8 && /[ -._~]/.test(raw)) {
    const values = new Set();
    for (let i = 0; i < raw.length; i++) {
      if (/\d/.test(raw[i])) {
        const weekNum = i + 1;
        if (weekNum >= 1 && weekNum <= limit) values.add(weekNum);
      }
    }
    if (values.size > 0) return [...values].sort((a, b) => a - b);
  }
  const digits = [...str.replace(/[\u00a0]/g, '')].filter((char) => /\d/.test(char));
  const values = [];
  let previous = 0;
  for (const char of digits) {
    let candidate = Number(char) === 0 ? 10 : Number(char);
    while (candidate <= previous) candidate += 10;
    if (candidate >= 1 && candidate <= limit) {
      values.push(candidate);
      previous = candidate;
    }
  }
  return [...new Set(values)].sort((a, b) => a - b);
}

function periodLabel(periods) {
  const values = normalizePeriods(periods);
  if (!values.length) return '—';
  return values.length === 1 ? `Tiết ${values[0]}` : `Tiết ${values[0]}–${values[values.length - 1]}`;
}

function sessionForPeriods(periods) {
  const first = normalizePeriods(periods)[0] || 1;
  return first <= 5 ? 'morning' : first <= 10 ? 'afternoon' : 'evening';
}

function displayTime(periods) {
  const key = normalizePeriods(periods).join(',');
  if (key === '1,2,3,4') return '07:25–11:30';
  if (key === '1,2,3,4,5') return '07:25–12:20';
  if (key === '1,2,3') return '07:25–10:10';
  if (key === '1,2') return '07:25–09:10';
  if (key === '4,5') return '10:15–12:20';
  if (key === '5') return '11:35–12:20';
  if (key === '6,7,8,9') return '12:55–17:00';
  if (key === '6,7,8,9,10') return '12:55–17:50';
  if (key === '6,7,8') return '12:55–15:40';
  if (key === '6,7') return '12:55–14:35';
  if (key === '8,9') return '14:45–17:00';
  if (key === '10') return '17:05–17:50';
  if (key === '11,12,13,14') return '17:55–21:00';
  if (key === '11,12,13') return '17:55–20:15';
  if (key === '11,12') return '17:55–19:30';
  const info = PERIOD_GROUPS[sessionForPeriods(periods)];
  return `${info.start}–${info.end}`;
}

function getHolidayForDate(dateStr) {
  for (const h of OFFICIAL_HOLIDAYS) {
    if (h.dateStr === dateStr) return h;
    if (h.endDateStr && dateStr >= h.dateStr && dateStr <= h.endDateStr) return h;
  }
  return null;
}

function getHolidaysForWeek(weekNum) {
  return OFFICIAL_HOLIDAYS.filter((h) => {
    if (h.endWeek) return weekNum >= h.week && weekNum <= h.endWeek;
    return h.week === weekNum;
  });
}

function eventsForWeek(week) {
  return schedule
    .filter((item) => item.weeks.includes(Number(week)))
    .map((item) => ({ ...item, date: dateAt(week, item.dow), session: sessionForPeriods(item.periods) }))
    .sort((a, b) => a.date - b.date || timeToMinutes(displayTime(a.periods).slice(0, 5)) - timeToMinutes(displayTime(b.periods).slice(0, 5)));
}
