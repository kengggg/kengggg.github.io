/**
 * Format a date to long string format (e.g., "04 March 2019")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date to ISO string for datetime attribute
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
