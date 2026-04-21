/**
 * main.js - Shared entry point for all pages
 * Initializes Lucide icons on every page load.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
