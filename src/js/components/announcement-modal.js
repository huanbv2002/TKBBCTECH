/**
 * TKB - Feature Announcement & Community Note Modal
 * Displays release information for Teacher Timetable feature
 */
const ANNOUNCEMENT_STORAGE_KEY = 'bctech_feature_announcement_v2';

function initAnnouncementModal() {
  const modal = document.getElementById('announcement-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('announcement-modal-close');
  const doneBtn = document.getElementById('announcement-modal-done');

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('hidden', '');
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
    } catch (_) {}

    // If onboarding tour hasn't completed, start it smoothly after announcement
    if (typeof startTour === 'function') {
      setTimeout(() => startTour(false), 300);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Check if previously dismissed
  let dismissed = false;
  try {
    dismissed = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) === 'true';
  } catch (_) {}

  if (!dismissed) {
    // Show after slight delay for smooth page render
    setTimeout(() => {
      modal.removeAttribute('hidden');
      modal.classList.add('show');
    }, 450);
  }
}

document.addEventListener('DOMContentLoaded', initAnnouncementModal);
