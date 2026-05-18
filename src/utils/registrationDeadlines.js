/**
 * registrationDeadlines.js
 * Central registry for competition registration deadlines.
 * Deadlines are set to 23:59:59 WIB (UTC+7) on the closing date.
 *
 * Add or adjust dates here — no other files need to change.
 */

export const DEADLINES = {
  uiux:    new Date('2026-05-16T23:59:59+07:00'), // UI/UX Design
  machine: new Date('2026-05-15T23:59:59+07:00'), // Machine Learning
  kpop:    new Date('2026-05-27T23:59:59+07:00'), // K-Pop Dance Cover
  compe:   new Date('2026-05-19T23:59:59+07:00'), // Competitive Programming
  poster:  new Date('2026-05-20T23:59:59+07:00'), // Poster Digital
  ml:      new Date('2026-05-24T23:59:59+07:00'), // Mobile Legends
  // band: no deadline set → always open
};

/**
 * Returns true if the registration for the given competition ID is closed.
 * @param {string} id - The competition ID (e.g. 'uiux', 'machine')
 * @returns {boolean}
 */
export function isClosed(id) {
  const deadline = DEADLINES[id];
  if (!deadline) return false;
  return new Date() > deadline;
}

/**
 * Returns the formatted deadline date string in Indonesian locale.
 * @param {string} id
 * @returns {string} e.g. "16 Mei 2026"
 */
export function getDeadlineLabel(id) {
  const deadline = DEADLINES[id];
  if (!deadline) return '-';
  return deadline.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}
