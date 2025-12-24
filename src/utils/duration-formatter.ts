/**
 * Format duration for display in German
 *
 * Converts a duration in years to a human-readable German string,
 * handling singular/plural forms and unlimited duration cases.
 *
 * @param duration - Number of years or null for unlimited duration
 * @returns Formatted duration string in German
 *
 * @example
 * ```typescript
 * formatDuration(1) // Returns: "1 Jahr"
 * formatDuration(25) // Returns: "25 Jahre"
 * formatDuration(null) // Returns: "unbegrenzt (Vermögen wächst weiter)"
 * formatDuration(0) // Returns: "unbegrenzt (Vermögen wächst weiter)"
 * ```
 */
export function formatDuration(duration: number | null): string {
  // Handle unlimited duration (null or 0)
  if (!duration) {
    return 'unbegrenzt (Vermögen wächst weiter)'
  }

  // Return singular "Jahr" for 1 year, plural "Jahre" for multiple years
  return `${duration} Jahr${duration === 1 ? '' : 'e'}`
}
