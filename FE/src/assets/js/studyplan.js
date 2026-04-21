/**
 * studyplan.js - Interactive study map logic for studyplan.html.
 * Handles SVG path animation and node state transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const totalSteps = 6;
  const progressPath = document.getElementById('progress-path');
  const pathLength = progressPath.getTotalLength();

  progressPath.style.strokeDasharray = pathLength;
  progressPath.style.strokeDashoffset = pathLength;

  let currentCompleted = 0;

  /**
   * Advances the study map to the given step, animating nodes and path.
   * @param {number} stepNumber - The step to complete up to.
   */
  window.completeStep = function (stepNumber) {
    if (stepNumber <= currentCompleted) return;

    for (let i = 1; i <= totalSteps; i++) {
      const node = document.getElementById(`node-${i}`);
      setTimeout(() => {
        if (i < stepNumber) {
          node.className = 'node node-completed relative z-10';
          node.style.borderWidth = '4px';
        } else if (i === stepNumber) {
          node.className = 'node node-active relative z-10';
          node.style.borderWidth = '4px';
          const wrapper = node.parentElement;
          const scroller = document.getElementById('map-scroller');
          scroller.scrollTo({
            left: wrapper.offsetLeft - scroller.clientWidth / 2 + 150,
            behavior: 'smooth',
          });
        } else {
          node.className = 'node node-locked relative z-10';
          node.style.borderWidth = '4px';
        }
      }, i < stepNumber ? i * 200 : stepNumber * 200);
    }

    const targetProgress = (stepNumber / totalSteps) * pathLength;
    progressPath.style.strokeDashoffset = pathLength - targetProgress;
    document.getElementById('progress-text').innerText = `${stepNumber}/${totalSteps}`;
    currentCompleted = stepNumber;
  };

  // Simulate initial progress on load
  setTimeout(() => window.completeStep(2), 600);
});
