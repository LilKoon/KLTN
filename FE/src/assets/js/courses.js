/**
 * courses.js - Logic for the "Khóa học của tôi" page.
 * Handles tab switching between "Khoá học chính" and "Khoá học đề xuất".
 */

/**
 * Switches the active tab and shows the corresponding content panel.
 * @param {'main'|'recommended'} tabId - The tab identifier to activate.
 */
function switchTab(tabId) {
  const tabs = {
    main: {
      btn: document.querySelectorAll('#course-tabs button')[0],
      content: document.getElementById('tab-main'),
    },
    recommended: {
      btn: document.querySelectorAll('#course-tabs button')[1],
      content: document.getElementById('tab-recommended'),
    },
  };

  // Reset all tabs to inactive — CSS handles all visual styling via .tab-btn + .tab-inactive
  Object.values(tabs).forEach((tab) => {
    tab.btn.classList.remove('tab-active');
    tab.btn.classList.add('tab-inactive');
    tab.content.classList.add('hidden');
    tab.content.classList.remove('block');
  });

  // Activate selected tab — CSS handles color/border via .tab-active
  tabs[tabId].btn.classList.remove('tab-inactive');
  tabs[tabId].btn.classList.add('tab-active');
  tabs[tabId].content.classList.remove('hidden');
  tabs[tabId].content.classList.add('block');
}
