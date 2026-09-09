import { CONFIG } from './config.js';

/**
 * Checks whether two time intervals [aStart, aEnd) and [bStart, bEnd) overlap.
 */
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Generates open inventory time slots for a given date and service.
 * @param {Object} params
 * @param {string} params.dateStr - Date string in "YYYY-MM-DD" format (New York local)
 * @param {Array} params.bookedRanges - Array of booked intervals [{ start: ms, end: ms }] (includes 30m buffer)
 * @param {number} params.durationMinutes - Job duration in minutes (e.g. 60, 120, 180)
 * @returns {Array<{ iso: string, label: string }>} Available slot objects
 */
export function buildSlots({ dateStr, bookedRanges = [], durationMinutes = 60 }) {
  const slots = [];
  const bufferMs = (CONFIG.travelBufferMinutes || 30) * 60 * 1000;
  const durationMs = durationMinutes * 60 * 1000;
  const stepMs = (CONFIG.slotMinutes || 60) * 60 * 1000;

  // Build New York start and end times for the working day
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Construct 7:00 AM start time in NY time
  const dayStart = new Date(Date.UTC(year, month - 1, day, 7 + 4, 0, 0, 0)); // Approx EDT offset
  // Set exact hours 7:00 to 20:00 using New York timezone
  const workStartMs = new Date(`${dateStr}T07:00:00-04:00`).getTime();
  const workEndMs = new Date(`${dateStr}T20:00:00-04:00`).getTime();

  const nowMs = Date.now();

  for (let currentStart = workStartMs; currentStart + durationMs <= workEndMs; currentStart += stepMs) {
    // Candidates job period includes the job duration
    const candidateJobEnd = currentStart + durationMs;
    // Buffer extends the blocked period for checking overlaps with existing bookings
    const candidateTotalEnd = candidateJobEnd + bufferMs;

    // Must be in the future (minimum 2-hour advance booking lead time)
    if (currentStart <= nowMs + 2 * 3600 * 1000) {
      continue;
    }

    // Check overlap with any existing booked range (which already includes buffer)
    const isBlocked = bookedRanges.some(booked => 
      overlaps(currentStart, candidateTotalEnd, booked.start, booked.end)
    );

    if (!isBlocked) {
      const dateObj = new Date(currentStart);
      const isoStr = dateObj.toISOString();
      const timeLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: CONFIG.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(dateObj);

      slots.push({
        iso: isoStr,
        timestamp: currentStart,
        label: timeLabel
      });
    }
  }

  return slots;
}
