/**
 * TKB - Daily Schedule Inspection View (Thanh tra / Toàn trường theo ngày)
 * Lọc thời khóa biểu toàn trường theo từng ngày, ca học, xưởng/phòng và giảng viên.
 */

const dailyState = {
  date: new Date(),
  campus: 'all', // 'all' | 'CS1' | 'CS2' | 'ONLINE'
  session: 'all', // 'all' | 'morning' | 'afternoon'
  search: ''
};

/**
 * Nhận diện Cơ sở (CS1 Đất Đỏ, CS2 Vũng Tàu, Trực tuyến) từ phòng học và thông tin lớp
 */
function detectCampus(room, classObj) {
  const r = String(room || '').trim().toUpperCase();
  if (r.includes('ONLINE')) return 'ONLINE';
  if (r.startsWith('DN')) return 'DN';
  if (classObj && classObj.campus === 'CS1') return 'CS1';
  if (classObj && classObj.campus === 'CS2') return 'CS2';
  if (r.startsWith('1') || r.includes('CS1') || r.includes('ĐẤT ĐỎ')) return 'CS1';
  if (r.startsWith('2') || r.includes('CS2') || r.includes('VŨNG TÀU')) return 'CS2';
  return 'CS1';
}

/**
 * Kiểm tra xem một tiết học có đang diễn ra ngay tại thời điểm hiện tại hay không
 */
function checkPeriodLive(periods, targetDate) {
  const todayKey = formatDateKey(new Date());
  const targetKey = formatDateKey(targetDate);
  if (todayKey !== targetKey) return false;

  const cur = new Date();
  const curMinutes = cur.getHours() * 60 + cur.getMinutes();

  // Khung giờ chi tiết các tiết tại trường
  const periodMinuteRanges = {
    1: [7 * 60 + 25, 8 * 60 + 10],
    2: [8 * 60 + 15, 9 * 60 + 0],
    3: [9 * 60 + 10, 9 * 60 + 55],
    4: [10 * 60 + 0, 10 * 60 + 45],
    5: [10 * 60 + 50, 11 * 60 + 35],
    6: [12 * 60 + 55, 13 * 60 + 40],
    7: [13 * 60 + 45, 14 * 60 + 30],
    8: [14 * 60 + 40, 15 * 60 + 25],
    9: [15 * 60 + 30, 16 * 60 + 15],
    10: [16 * 60 + 20, 17 * 60 + 5]
  };

  const list = normalizePeriods(periods);
  if (!list.length) return false;

  const firstP = list[0];
  const lastP = list[list.length - 1];

  const startRange = periodMinuteRanges[firstP];
  const endRange = periodMinuteRanges[lastP];

  if (!startRange || !endRange) return false;

  return curMinutes >= startRange[0] && curMinutes <= endRange[1];
}

/**
 * Trích xuất toàn bộ các tiết học diễn ra trong ngày được chọn từ CSDL lớp học
 */
function getDailyClassesData(targetDate) {
  const dow = schoolDayForDate(targetDate);
  const weekNum = weekForDate(targetDate);

  if (typeof ALL_CLASSES_DATABASE !== 'object' || !ALL_CLASSES_DATABASE) {
    return [];
  }

  const results = [];
  const visitedKeys = new Set();

  for (const [classCode, classObj] of Object.entries(ALL_CLASSES_DATABASE)) {
    if (!classObj || !Array.isArray(classObj.schedule)) continue;

    for (const item of classObj.schedule) {
      if (Number(item.dow) !== dow) continue;

      const weeksList = Array.isArray(item.weeks) ? item.weeks : parseWeeks(String(item.weeks || ''));
      if (!weeksList.includes(weekNum)) continue;

      const periods = normalizePeriods(item.periods);
      if (!periods.length) continue;

      // Unique deduplication key
      const key = `${classCode}_${item.dow}_${periods.join(',')}_${item.room}_${item.subject}_${item.teacher}`;
      if (visitedKeys.has(key)) continue;
      visitedKeys.add(key);

      const campus = detectCampus(item.room, classObj);
      const session = sessionForPeriods(periods);

      results.push({
        classCode: classObj.code || classCode,
        className: classObj.name || `Lớp ${classCode}`,
        classMajor: classObj.major || '',
        dept: classObj.dept || '',
        subject: cleanText(item.subject),
        teacher: cleanText(item.teacher),
        room: normalizeRoom(item.room),
        periods,
        periodText: periodLabel(periods),
        timeText: displayTime(periods),
        dow,
        weekNum,
        campus,
        session,
        isLive: checkPeriodLive(periods, targetDate)
      });
    }
  }

  // Sắp xếp: Tiết bắt đầu -> Phòng học -> Tên lớp
  results.sort((a, b) => {
    const pA = a.periods[0] || 0;
    const pB = b.periods[0] || 0;
    if (pA !== pB) return pA - pB;
    if (a.room !== b.room) return a.room.localeCompare(b.room);
    return a.classCode.localeCompare(b.classCode);
  });

  return results;
}

/**
 * Đổi ngày đang xem (tăng/giảm số ngày)
 */
function stepDailyDate(days) {
  const next = new Date(dailyState.date);
  next.setDate(next.getDate() + days);
  dailyState.date = next;
  renderDailyView();
}

/**
 * Đặt ngày cụ thể
 */
function setDailyDateValue(dateString) {
  if (!dateString) return;
  const parts = dateString.split('-').map(Number);
  if (parts.length === 3) {
    dailyState.date = new Date(parts[0], parts[1] - 1, parts[2]);
    renderDailyView();
  }
}

/**
 * Nhảy về ngày Hôm nay
 */
function resetDailyToToday() {
  dailyState.date = new Date();
  renderDailyView();
}

/**
 * Đặt bộ lọc Cơ sở
 */
function setDailyCampusFilter(campus) {
  dailyState.campus = campus;
  renderDailyView();
}

/**
 * Đặt bộ lọc Buổi học
 */
function setDailySessionFilter(session) {
  dailyState.session = session;
  renderDailyView();
}

/**
 * Cập nhật ô tìm kiếm
 */
function handleDailySearchInput(value) {
  dailyState.search = String(value || '').trim().toLowerCase();
  renderDailyView();
}

/**
 * Xóa tìm kiếm
 */
function clearDailySearch() {
  dailyState.search = '';
  const input = $('daily-search-input');
  if (input) input.value = '';
  renderDailyView();
}

/**
 * Chuyển thẳng sang xem TKB tuần của lớp được chọn
 */
function jumpToClassFromDaily(classCode) {
  if (typeof switchClass === 'function') {
    switchClass(classCode);
    if (typeof showView === 'function') {
      showView('week');
    }
  }
}

/**
 * Lệnh in lịch kiểm tra
 */
function printDailyInspectionSchedule() {
  window.print();
}

/**
 * Render toàn bộ giao diện Tra cứu theo ngày
 */
function renderDailyView() {
  const container = $('daily-view-content');
  if (!container) return;

  const targetDate = dailyState.date;
  const dow = schoolDayForDate(targetDate);
  const weekNum = weekForDate(targetDate);
  const dateKey = formatDateKey(targetDate);
  const holiday = getHolidayForDate(dateKey);

  // 1. Lấy dữ liệu & áp dụng bộ lọc
  const allSessions = getDailyClassesData(targetDate);

  const filteredSessions = allSessions.filter((item) => {
    // Lọc theo cơ sở
    if (dailyState.campus !== 'all') {
      if (dailyState.campus === 'ONLINE' && item.campus !== 'ONLINE') return false;
      if (dailyState.campus === 'CS1' && item.campus !== 'CS1') return false;
      if (dailyState.campus === 'CS2' && item.campus !== 'CS2') return false;
    }

    // Lọc theo buổi
    if (dailyState.session !== 'all' && item.session !== dailyState.session) {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (dailyState.search) {
      const q = dailyState.search;
      const match =
        item.teacher.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q) ||
        item.classCode.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.classMajor.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Tách ca Sáng và Ca Chiều
  const morningList = filteredSessions.filter((s) => s.session === 'morning');
  const afternoonList = filteredSessions.filter((s) => s.session === 'afternoon');

  // Thống kê nhanh
  const uniqueClasses = new Set(filteredSessions.map((s) => s.classCode)).size;
  const uniqueTeachers = new Set(filteredSessions.map((s) => s.teacher).filter(Boolean)).size;
  const uniqueRooms = new Set(filteredSessions.map((s) => s.room).filter(Boolean)).size;

  // Hiển thị tên thứ và ngày
  const dayNameStr = fullDay(dow);
  const dateFormattedStr = formatDate(targetDate);

  // Render HTML
  container.innerHTML = `
    <div class="daily-container">
      <!-- 1. Header Card & Controls -->
      <div class="daily-header-card">
        <div class="daily-date-controls">
          <div class="daily-date-stepper">
            <button type="button" class="daily-step-btn" onclick="stepDailyDate(-1)" title="Xem ngày trước (Phím tắt: Mũi tên trái)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="daily-date-picker-wrap" title="Bấm vào để chọn ngày bất kỳ">
              <input type="date" value="${dateKey}" onchange="setDailyDateValue(this.value)" aria-label="Chọn ngày tra cứu" />
              <div class="daily-date-display">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>${dayNameStr}, ${dateFormattedStr}</span>
                <span class="daily-week-tag">Tuần ${weekNum}</span>
              </div>
            </div>
            <button type="button" class="daily-step-btn" onclick="stepDailyDate(1)" title="Xem ngày sau (Phím tắt: Mũi tên phải)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <div class="daily-header-actions">
            <button type="button" class="daily-today-btn" onclick="resetDailyToToday()" title="Xem lịch ngày hôm nay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Hôm nay</span>
            </button>
            <button type="button" class="daily-print-btn" onclick="printDailyInspectionSchedule()" title="In danh sách A4 kẹp bìa kiểm tra">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>In danh sách</span>
            </button>
          </div>
        </div>

        <!-- 2. Filter Toolbar -->
        <div class="daily-filter-toolbar">
          <div class="daily-filter-group">
            <span class="daily-filter-label">Cơ sở:</span>
            <div class="daily-pills">
              <button type="button" class="daily-pill-btn ${dailyState.campus === 'all' ? 'active' : ''}" onclick="setDailyCampusFilter('all')">Tất cả</button>
              <button type="button" class="daily-pill-btn ${dailyState.campus === 'CS1' ? 'active' : ''}" onclick="setDailyCampusFilter('CS1')">CS1 - Đất Đỏ</button>
              <button type="button" class="daily-pill-btn ${dailyState.campus === 'CS2' ? 'active' : ''}" onclick="setDailyCampusFilter('CS2')">CS2 - Vũng Tàu</button>
              <button type="button" class="daily-pill-btn ${dailyState.campus === 'ONLINE' ? 'active' : ''}" onclick="setDailyCampusFilter('ONLINE')">P.ONLINE</button>
            </div>
          </div>

          <div class="daily-filter-group">
            <span class="daily-filter-label">Buổi:</span>
            <div class="daily-pills">
              <button type="button" class="daily-pill-btn ${dailyState.session === 'all' ? 'active' : ''}" onclick="setDailySessionFilter('all')">Cả ngày</button>
              <button type="button" class="daily-pill-btn ${dailyState.session === 'morning' ? 'active' : ''}" onclick="setDailySessionFilter('morning')">Ca Sáng</button>
              <button type="button" class="daily-pill-btn ${dailyState.session === 'afternoon' ? 'active' : ''}" onclick="setDailySessionFilter('afternoon')">Ca Chiều</button>
            </div>
          </div>

          <!-- Search box -->
          <div class="daily-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="daily-search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              id="daily-search-input"
              class="daily-search-input"
              placeholder="Lọc Giảng viên, Phòng/Xưởng (vd: LAB, X.HÀN), Lớp..."
              value="${escapeHtml(dailyState.search)}"
              oninput="handleDailySearchInput(this.value)"
              autocomplete="off"
            />
            ${dailyState.search ? `
              <button type="button" class="daily-search-clear" onclick="clearDailySearch()" title="Xóa tìm kiếm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Holiday Warning Banner (nếu rơi vào ngày nghỉ) -->
      ${holiday ? `
        <div class="daily-holiday-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <div>
            <strong>Thông báo nghỉ: ${escapeHtml(holiday.name)}</strong>
            <div style="font-size: 12.5px; opacity: 0.9; margin-top: 2px;">${escapeHtml(holiday.note)}</div>
          </div>
        </div>
      ` : ''}

      <!-- 3. Summary Stats Bar -->
      <div class="daily-stats-bar">
        <div class="daily-stats-counts">
          <div class="daily-stat-badge">
            <span>Tổng số:</span>
            <b>${filteredSessions.length}</b> tiết/nhóm
          </div>
          <div class="daily-stat-badge">
            <span>Lớp học:</span>
            <b>${uniqueClasses}</b> lớp
          </div>
          <div class="daily-stat-badge">
            <span>Giảng viên:</span>
            <b>${uniqueTeachers}</b> thầy/cô
          </div>
          <div class="daily-stat-badge">
            <span>Địa điểm:</span>
            <b>${uniqueRooms}</b> phòng/xưởng
          </div>
        </div>
      </div>

      <!-- 4. Content Sessions -->
      ${filteredSessions.length === 0 ? `
        <div class="daily-empty-card">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="daily-empty-icon"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <h4>Không có tiết học nào phù hợp</h4>
          <p>${dailyState.search ? 'Không tìm thấy kết quả nào khớp với từ khóa tìm kiếm của bạn.' : (dow === 8 ? 'Chủ nhật toàn trường nghỉ học.' : 'Ngày này không có lịch học trong thời khóa biểu.')}</p>
        </div>
      ` : `
        ${morningList.length > 0 ? renderSessionCardHtml('CA SÁNG (07:25 – 11:35)', morningList) : ''}
        ${afternoonList.length > 0 ? renderSessionCardHtml('CA CHIỀU (12:55 – 17:05)', afternoonList) : ''}
      `}
    </div>
  `;
}

/**
 * Render thẻ bảng cho từng ca học (Sáng / Chiều)
 */
function renderSessionCardHtml(title, items) {
  return `
    <div class="daily-session-card">
      <div class="daily-session-header">
        <div class="daily-session-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${title}</span>
        </div>
        <span class="daily-session-badge">${items.length} lớp học</span>
      </div>

      <!-- Desktop Table -->
      <div class="daily-table-wrap">
        <table class="daily-table">
          <thead>
            <tr>
              <th style="width: 120px;">Tiết / Giờ</th>
              <th style="width: 160px;">Phòng / Xưởng</th>
              <th style="width: 130px;">Lớp</th>
              <th>Môn học</th>
              <th style="width: 180px;">Giảng viên</th>
              <th style="width: 120px; text-align: center;">Cơ sở</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <td class="daily-period-col">
                  <div>${item.periodText}</div>
                  <span class="daily-time-sub">${item.timeText}</span>
                  ${item.isLive ? '<span class="daily-live-badge"><span class="daily-live-dot"></span>Đang học</span>' : ''}
                </td>
                <td>
                  <span class="daily-room-badge ${getRoomClass(item.room)}">
                    ${escapeHtml(item.room)}
                  </span>
                </td>
                <td>
                  <a href="javascript:void(0)" class="daily-class-badge" onclick="jumpToClassFromDaily('${item.classCode}')" title="Xem thời khóa biểu tuần của lớp ${item.classCode}">
                    ${escapeHtml(item.classCode)}
                  </a>
                </td>
                <td class="daily-subject-cell">
                  <div>${escapeHtml(item.subject)}</div>
                  ${item.classMajor ? `<span class="daily-subject-major">${escapeHtml(item.classMajor)}</span>` : ''}
                </td>
                <td class="daily-teacher-cell">
                  ${escapeHtml(item.teacher || 'Chưa phân công')}
                </td>
                <td style="text-align: center;">
                  <span class="daily-campus-tag ${item.campus.toLowerCase()}">
                    ${item.campus === 'CS1' ? 'CS1 - Đất Đỏ' : item.campus === 'CS2' ? 'CS2 - Vũng Tàu' : item.campus === 'ONLINE' ? 'Trực tuyến' : item.campus}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards List -->
      <div class="daily-mobile-cards">
        ${items.map((item) => `
          <div class="daily-card-item">
            <div class="daily-card-header">
              <span class="daily-room-badge ${getRoomClass(item.room)}">
                ${escapeHtml(item.room)}
              </span>
              <span class="daily-campus-tag ${item.campus.toLowerCase()}">
                ${item.campus === 'CS1' ? 'CS1 Đất Đỏ' : item.campus === 'CS2' ? 'CS2 Vũng Tàu' : 'ONLINE'}
              </span>
            </div>
            <div class="daily-card-subject">
              ${escapeHtml(item.subject)}
            </div>
            <div class="daily-card-grid">
              <div class="daily-card-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${item.periodText} (${item.timeText})</span>
              </div>
              <div class="daily-card-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                <strong>${escapeHtml(item.teacher || '—')}</strong>
              </div>
              <div class="daily-card-row" style="grid-column: span 2;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path></svg>
                <span>Lớp: <a href="javascript:void(0)" class="daily-class-badge" onclick="jumpToClassFromDaily('${item.classCode}')">${item.classCode}</a> ${item.classMajor ? `· ${escapeHtml(item.classMajor)}` : ''}</span>
              </div>
            </div>
            ${item.isLive ? '<div><span class="daily-live-badge"><span class="daily-live-dot"></span>Đang diễn ra</span></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Phân loại màu sắc phòng học / nhà xưởng
 */
function getRoomClass(room) {
  const r = String(room || '').toUpperCase();
  if (r.includes('ONLINE')) return 'online';
  if (r.includes('X.') || r.includes('XƯỞNG') || r.includes('TIỆN') || r.includes('HÀN') || r.includes('OTO')) return 'workshop';
  return 'theory';
}
