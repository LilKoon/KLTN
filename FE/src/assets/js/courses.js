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

  Object.values(tabs).forEach((tab) => {
    tab.btn.classList.remove('tab-active');
    tab.btn.classList.add('tab-inactive');
    tab.content.classList.add('hidden');
    tab.content.classList.remove('block');
  });

  tabs[tabId].btn.classList.remove('tab-inactive');
  tabs[tabId].btn.classList.add('tab-active');
  tabs[tabId].content.classList.remove('hidden');
  tabs[tabId].content.classList.add('block');
}
