/**
 * TKB - Interactive Onboarding Tour Component
 * Friendly & Easy to understand for older adults and non-tech users
 * Each step focuses on exactly ONE feature/button
 */

const TOUR_STORAGE_KEY = 'tkb-tour-completed-v1';

const TOUR_STEPS = [
  {
    target: () => document.getElementById('class-picker-trigger'),
    title: '1. Chọn lớp cần xem lịch',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Bấm vào đây để chọn đúng lớp học của bạn hoặc con em mình.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
        Hệ thống sẽ hiển thị đầy đủ tên môn học, phòng học và thầy cô giảng dạy ngay lập tức.
      </p>
    `,
    preferredPos: 'bottom'
  },
  {
    target: () => {
      const isMobile = window.innerWidth <= 768;
      if (typeof showView === 'function' && typeof activeView !== 'undefined' && activeView !== 'week') {
        showView('week');
      }
      return isMobile 
        ? (document.getElementById('mobile-mode-toggle') || document.getElementById('week-range'))
        : (document.querySelector('.toolbar-actions') || document.getElementById('week-range'));
    },
    title: '2. Cách xem lịch theo tuần',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Bạn có thể chọn 1 trong 2 cách xem rất tiện lợi:
      </p>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 1.5; color: #334155;">
        <div style="background: #f8fafc; padding: 7px 10px; border-radius: 8px;">
          • <b>Từng ngày</b>: Xem chi tiết từng ngày một. Bấm vào các thứ (Thứ 2 đến Chủ nhật) ở trên để xem sáng và chiều học môn gì.
        </div>
        <div style="background: #f8fafc; padding: 7px 10px; border-radius: 8px;">
          • <b>Cả tuần</b>: Xem toàn bộ lịch học từ Thứ 2 đến Chủ nhật trên cùng một màn hình.
        </div>
      </div>
    `,
    preferredPos: 'bottom'
  },
  {
    target: () => {
      const isMobile = window.innerWidth <= 768;
      return isMobile ? document.querySelector('.mobile-bottom-nav') : document.querySelector('.nav');
    },
    title: '3. Các mục xem lịch khác',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Dưới đáy màn hình có các nút để bạn chuyển đổi nhanh:
      </p>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 1.5; color: #334155;">
        <div>• <b>Lịch tuần</b>: Xem thời khóa biểu theo từng tuần học.</div>
        <div>• <b>Lịch tháng</b>: Xem lịch theo dạng tờ lịch tháng quen thuộc.</div>
        <div>• <b>22 Tuần</b>: Xem lịch cả học kỳ và các ngày được nghỉ Lễ, Tết.</div>
      </div>
    `,
    preferredPos: 'top'
  },
  {
    target: () => {
      if (typeof showView === 'function' && typeof activeView !== 'undefined' && activeView !== 'week') {
        showView('week');
      }
      if (typeof setMobileScheduleMode === 'function') {
        setMobileScheduleMode('agenda');
      }
      const isMobile = window.innerWidth <= 768;
      return isMobile
        ? (document.querySelector('.agenda-day-header button') || document.querySelector('.agenda-day-header') || document.getElementById('mobile-agenda-view'))
        : (document.querySelector('.note-slot') || document.getElementById('week-board'));
    },
    title: '4. Thêm ghi chú bài học',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Bấm vào nút <b>Ghi chú</b> (hoặc bấm vào ô ngày bất kỳ) để lưu lại lời nhắc bài tập, lịch thi hoặc việc cần làm.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
        Mọi ghi chú được lưu an toàn và riêng tư ngay trên thiết bị của bạn.
      </p>
    `,
    preferredPos: 'bottom'
  },
  {
    target: () => document.getElementById('upload-pdf-btn'),
    title: '5. Cập nhật khi có lịch mới (PDF)',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Khi nhà trường công bố file thời khóa biểu mới dạng PDF, bạn chỉ cần bấm vào nút <b>Cập nhật PDF</b> này.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
        Hệ thống sẽ tự động quét và cập nhật lại toàn bộ lịch học của 61 lớp trong trường.
      </p>
    `,
    preferredPos: 'bottom'
  },
  {
    target: () => document.getElementById('today-btn'),
    title: '6. Nút quay về "Hôm nay"',
    content: `
      <p style="margin: 0 0 8px 0; font-size: 13.5px; line-height: 1.55; color: #334155;">
        Khi bạn đang xem các tuần khác hoặc tháng khác, bấm nút <b>Hôm nay</b> bất cứ lúc nào để quay về ngay lịch của ngày hôm nay.
      </p>
    `,
    preferredPos: 'bottom'
  }
];

let currentTourStep = 0;
let tourOverlayEl = null;
let tourSpotlightEl = null;
let tourPopoverEl = null;
let boundTourKeyHandler = null;
let boundTourResizeHandler = null;

function isTourCompleted() {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function markTourCompleted() {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, '1');
  } catch (_) {}
}

function startTour(force = false) {
  if (!force && isTourCompleted()) return;

  currentTourStep = 0;
  cleanupTour();

  // 1. Create Overlay
  tourOverlayEl = document.createElement('div');
  tourOverlayEl.className = 'tour-overlay';
  document.body.appendChild(tourOverlayEl);

  // 2. Create Spotlight
  tourSpotlightEl = document.createElement('div');
  tourSpotlightEl.className = 'tour-spotlight';
  document.body.appendChild(tourSpotlightEl);

  // 3. Create Popover
  tourPopoverEl = document.createElement('div');
  tourPopoverEl.className = 'tour-popover';
  document.body.appendChild(tourPopoverEl);

  // Bind Keyboard events
  boundTourKeyHandler = function(e) {
    if (e.key === 'Escape') {
      endTour();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (currentTourStep < TOUR_STEPS.length - 1) {
        nextTourStep();
      } else {
        endTour();
      }
    } else if (e.key === 'ArrowLeft') {
      prevTourStep();
    }
  };
  document.addEventListener('keydown', boundTourKeyHandler);

  // Bind Resize / Scroll handler
  boundTourResizeHandler = function() {
    positionTourStep(currentTourStep);
  };
  window.addEventListener('resize', boundTourResizeHandler, { passive: true });
  window.addEventListener('scroll', boundTourResizeHandler, { passive: true });

  // Show
  requestAnimationFrame(function() {
    tourOverlayEl.classList.add('show');
    renderTourStep(0);
  });
}

function renderTourStep(stepIdx) {
  if (stepIdx < 0 || stepIdx >= TOUR_STEPS.length) return;
  currentTourStep = stepIdx;

  const step = TOUR_STEPS[stepIdx];
  const targetEl = typeof step.target === 'function' ? step.target() : step.target;

  const isMobile = window.innerWidth <= 768;

  if (targetEl) {
    if (isMobile) {
      if (stepIdx === 0 || stepIdx === 4 || stepIdx === 5) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (stepIdx === 1) {
        const topbarHeight = 56;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, targetTop - topbarHeight - 10), behavior: 'instant' });
      } else if (stepIdx === 3) {
        const topbarHeight = 56;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, targetTop - topbarHeight - 20), behavior: 'instant' });
      }
    } else {
      targetEl.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
    }
  }

  const totalSteps = TOUR_STEPS.length;
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === totalSteps - 1;

  let dotsHtml = '';
  for (let i = 0; i < totalSteps; i++) {
    dotsHtml += '<span class="tour-dot ' + (i === stepIdx ? 'active' : '') + '"></span>';
  }

  tourPopoverEl.innerHTML = `
    <div class="tour-header">
      <span class="tour-badge">Hướng dẫn ${stepIdx + 1} / ${totalSteps}</span>
      <button class="tour-close-btn" id="tour-close-btn" title="Đóng hướng dẫn" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <h3 class="tour-title">${step.title}</h3>
    <div class="tour-description">${step.content}</div>
    <div class="tour-footer">
      <div class="tour-dots">${dotsHtml}</div>
      <div class="tour-actions">
        <button class="tour-btn-skip" id="tour-btn-skip" type="button">Bỏ qua</button>
        ${!isFirst ? '<button class="tour-btn-prev" id="tour-btn-prev" type="button">Xem lại</button>' : ''}
        <button class="tour-btn-next" id="tour-btn-next" type="button">
          <span>${isLast ? 'Đã hiểu, bắt đầu' : 'Xem tiếp'}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  `;

  // Attach button listeners
  const closeBtn = document.getElementById('tour-close-btn');
  const skipBtn = document.getElementById('tour-btn-skip');
  const prevBtn = document.getElementById('tour-btn-prev');
  const nextBtn = document.getElementById('tour-btn-next');

  if (closeBtn) closeBtn.onclick = endTour;
  if (skipBtn) skipBtn.onclick = endTour;
  if (prevBtn) prevBtn.onclick = prevTourStep;
  if (nextBtn) {
    nextBtn.onclick = function() {
      if (isLast) {
        endTour();
      } else {
        nextTourStep();
      }
    };
  }

  // Double RAF for accurate layout sizing before positioning
  requestAnimationFrame(function() {
    positionTourStep(stepIdx);
    requestAnimationFrame(function() {
      positionTourStep(stepIdx);
      tourPopoverEl.classList.add('show');
    });
  });
}

function positionTourStep(stepIdx) {
  if (!tourPopoverEl || !tourSpotlightEl) return;
  const step = TOUR_STEPS[stepIdx];
  if (!step) return;

  const targetEl = typeof step.target === 'function' ? step.target() : step.target;
  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const pad = 6;

  // Position Spotlight
  const spotTop = Math.max(0, rect.top - pad);
  const spotLeft = Math.max(0, rect.left - pad);
  const spotWidth = Math.min(window.innerWidth - spotLeft, rect.width + pad * 2);
  const spotHeight = Math.min(window.innerHeight - spotTop, rect.height + pad * 2);

  tourSpotlightEl.style.top = spotTop + 'px';
  tourSpotlightEl.style.left = spotLeft + 'px';
  tourSpotlightEl.style.width = spotWidth + 'px';
  tourSpotlightEl.style.height = spotHeight + 'px';

  // Position Popover
  const popoverRect = tourPopoverEl.getBoundingClientRect();
  const popWidth = popoverRect.width || 340;
  const popHeight = popoverRect.height || 220;
  const margin = 12;

  let top = 0;
  let left = 0;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    left = 12;
    tourPopoverEl.style.width = (window.innerWidth - 24) + 'px';

    if (stepIdx === 2 || rect.top > window.innerHeight - 160) {
      top = Math.max(margin, rect.top - popHeight - margin);
    } else {
      top = rect.bottom + margin;
      if (top + popHeight > window.innerHeight - margin) {
        tourPopoverEl.style.maxHeight = (window.innerHeight - top - margin) + 'px';
      } else {
        tourPopoverEl.style.maxHeight = 'calc(100vh - 80px)';
      }
    }
  } else {
    tourPopoverEl.style.width = '360px';
    tourPopoverEl.style.maxHeight = 'none';

    let pref = step.preferredPos || 'bottom';

    if (pref === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left;
      if (top + popHeight > window.innerHeight - margin) {
        top = rect.top - popHeight - margin;
      }
    } else if (pref === 'top') {
      top = rect.top - popHeight - margin;
      left = rect.left;
      if (top < margin) {
        top = rect.bottom + margin;
      }
    } else if (pref === 'right') {
      top = rect.top;
      left = rect.right + margin;
      if (left + popWidth > window.innerWidth - margin) {
        left = rect.left - popWidth - margin;
      }
    }

    if (left + popWidth > window.innerWidth - margin) {
      left = window.innerWidth - popWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + popHeight > window.innerHeight - margin) {
      top = window.innerHeight - popHeight - margin;
    }
    if (top < margin) {
      top = margin;
    }
  }

  tourPopoverEl.style.top = top + 'px';
  tourPopoverEl.style.left = left + 'px';
}

function nextTourStep() {
  if (currentTourStep < TOUR_STEPS.length - 1) {
    tourPopoverEl.classList.remove('show');
    setTimeout(function() {
      renderTourStep(currentTourStep + 1);
    }, 120);
  } else {
    endTour();
  }
}

function prevTourStep() {
  if (currentTourStep > 0) {
    tourPopoverEl.classList.remove('show');
    setTimeout(function() {
      renderTourStep(currentTourStep - 1);
    }, 120);
  }
}

function endTour() {
  markTourCompleted();
  cleanupTour();
}

function cleanupTour() {
  if (boundTourKeyHandler) {
    document.removeEventListener('keydown', boundTourKeyHandler);
    boundTourKeyHandler = null;
  }
  if (boundTourResizeHandler) {
    window.removeEventListener('resize', boundTourResizeHandler);
    window.removeEventListener('scroll', boundTourResizeHandler);
    boundTourResizeHandler = null;
  }
  if (tourOverlayEl && tourOverlayEl.parentNode) {
    tourOverlayEl.parentNode.removeChild(tourOverlayEl);
    tourOverlayEl = null;
  }
  if (tourSpotlightEl && tourSpotlightEl.parentNode) {
    tourSpotlightEl.parentNode.removeChild(tourSpotlightEl);
    tourSpotlightEl = null;
  }
  if (tourPopoverEl && tourPopoverEl.parentNode) {
    tourPopoverEl.parentNode.removeChild(tourPopoverEl);
    tourPopoverEl = null;
  }
}
