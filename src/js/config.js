/**
 * TKB - Global Configurations & Constants
 */
const STORAGE = {
  settings: 'tkb-settings-v4',
  schedule: 'tkb-schedule-v4',
  notes: 'tkb-notes-v3',
  customDatabase: 'tkb-custom-database'
};

const DEFAULT_SETTINGS = {
  classCode: 'CD25CNTT2',
  semesterStart: '2026-09-07',
  maxWeeks: 18
};

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const fullDays = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const dayOrder = [2, 3, 4, 5, 6, 7, 8];
const sessionOrder = ['morning', 'afternoon', 'evening'];

const NOTE_ICON_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4a2 2 0 0 0-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM7 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;
const TRASH_ICON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

const PERIOD_GROUPS = {
  morning: { label: 'Sáng', start: '07:25', end: '12:20', periods: [1, 2, 3, 4, 5] },
  afternoon: { label: 'Chiều', start: '12:55', end: '17:50', periods: [6, 7, 8, 9, 10] },
  evening: { label: 'Tối', start: '17:55', end: '21:45', periods: [11, 12, 13, 14, 15] },
};

const OFFICIAL_HOLIDAYS = [
  {
    id: 'vn-teachers-day',
    name: 'Ngày Nhà Giáo Việt Nam',
    dateStr: '2026-11-20',
    displayDate: 'Thứ Sáu, 20/11/2026',
    week: 11,
    type: 'vn-teacher',
    note: 'Nghỉ toàn trường kỷ niệm Ngày Nhà Giáo Việt Nam 20/11'
  },
  {
    id: 'vietnam-culture-day',
    name: 'Ngày Văn Hóa Việt Nam',
    dateStr: '2026-11-24',
    displayDate: 'Thứ Ba, 24/11/2026',
    week: 12,
    type: 'culture',
    note: 'Nghỉ theo kế hoạch đào tạo nhà trường'
  },
  {
    id: 'new-year-2027',
    name: 'Tết Dương Lịch 2027',
    dateStr: '2027-01-01',
    displayDate: 'Thứ Sáu, 01/01/2027',
    week: 17,
    type: 'new-year',
    note: 'Nghỉ Tết Dương Lịch 2027'
  },
  {
    id: 'lunar-new-year-2027',
    name: 'Tết Nguyên Đán (Đinh Mùi 2027)',
    dateStr: '2027-01-25',
    endDateStr: '2027-02-07',
    displayDate: '25/01/2027 – 07/02/2027',
    week: 21,
    endWeek: 22,
    type: 'tet',
    note: 'Nghỉ Tết Âm Lịch 2 tuần liên tiếp (Tuần 21 & Tuần 22)'
  }
];
