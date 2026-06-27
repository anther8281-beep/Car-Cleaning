/**
 * Format a 24-hour "HH:mm" time string as 12-hour clock time with AM/PM.
 * Storage and booking logic keep the canonical 24h "HH:mm" form; this is for
 * display only. e.g. "09:00" -> "9:00 AM", "13:30" -> "1:30 PM",
 * "00:00" -> "12:00 AM", "12:00" -> "12:00 PM".
 */
export function formatTime(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return hhmm;
  let hour = Number(m[1]);
  const minutes = m[2];
  const period = hour < 12 ? "AM" : "PM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minutes} ${period}`;
}

/** Format an open/close range, e.g. ("08:00","18:00") -> "8:00 AM – 6:00 PM". */
export function formatTimeRange(open: string, close: string): string {
  return `${formatTime(open)} – ${formatTime(close)}`;
}
