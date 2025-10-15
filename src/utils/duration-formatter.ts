/**
 * Format duration for display
 * @param duration - Number of years or null for unlimited
 * @returns Formatted duration string
 */
export function formatDuration(duration: number | null): string {
  if (!duration) {
    return 'unbegrenzt (Vermögen wächst weiter)'
  }

  return `${duration} Jahr${duration === 1 ? '' : 'e'}`
}
