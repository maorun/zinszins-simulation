/**
 * Return unique values from an array, filtering out undefined values.
 * Preserves the order of first occurrence.
 * Uses Set for O(n) performance instead of O(n²).
 *
 * @param data - Array to filter for unique values
 * @returns Array with unique values, or empty array if input is null/undefined/empty
 */
export const unique = function <T extends undefined | number | string>(data: undefined | null | T[]): T[] {
  if (!data || !data.length) {
    return []
  }
  // Filter out undefined values and use Set for deduplication
  const filtered = data.filter((item): item is Exclude<T, undefined> => item !== undefined)
  return Array.from(new Set(filtered))
}
