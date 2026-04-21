/**
 * flashcard-create.js - Logic for the flashcard creation page.
 * Handles view switching between select / manual / upload / scan-results.
 */

const views = ['view-select', 'view-manual', 'view-upload', 'view-scan-results'];

/**
 * Shows the target view and hides all others.
 * @param {string} viewId - The ID of the view to display.
 */
function switchView(viewId) {
  views.forEach((id) => {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
  });

  const target = document.getElementById(viewId);
  target.classList.remove('hidden');
  target.classList.add('flex');

  const btnSave = document.getElementById('btnSave');
  if (viewId === 'view-manual') {
    btnSave.classList.remove('hidden');
    btnSave.classList.add('flex');
  } else {
    btnSave.classList.add('hidden');
    btnSave.classList.remove('flex');
  }
}

function simulateAIProcessing() {
  switchView('view-scan-results');
  document.getElementById('ai-loading').classList.remove('hidden');
  document.getElementById('ai-loading').classList.add('flex');
  document.getElementById('ai-results').classList.add('hidden');
  document.getElementById('ai-results').classList.remove('flex');

  setTimeout(() => {
    document.getElementById('ai-loading').classList.add('hidden');
    document.getElementById('ai-loading').classList.remove('flex');
    document.getElementById('ai-results').classList.remove('hidden');
    document.getElementById('ai-results').classList.add('flex');
  }, 2500);
}

function finishCreation() {
  alert('Tạo bộ flashcard thành công! Hệ thống đang chuyển hướng...');
  window.location.href = 'flashcard-detail.html';
}
