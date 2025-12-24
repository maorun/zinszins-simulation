/**
 * Return unique values from an array, filtering out undefined values.
 * Preserves the order of first occurrence.
 * Uses Set for O(n) performance instead of O(n²).
 *
 * @param data - Array to filter for unique values
 * @returns Array with unique values, or empty array if input is null/undefined/empty
 *
 * @example
 * ```typescript
 * unique([1, 2, 2, 3, undefined, 3, 4]) // Returns: [1, 2, 3, 4]
 * unique(['a', 'b', 'a', 'c']) // Returns: ['a', 'b', 'c']
 * unique([]) // Returns: []
 * unique(null) // Returns: []
 * ```
 */
export const unique = function <T extends undefined | number | string>(data: undefined | null | T[]): T[] {
  if (!data || !data.length) {
    return []
  }
  // Filter out undefined values and use Set for deduplication
  const filtered = data.filter((item): item is Exclude<T, undefined> => item !== undefined)
  return Array.from(new Set(filtered))
}

/**
 * Check if an object is empty (has no own enumerable properties).
 * More performant than Object.keys(obj).length === 0 for large objects.
 *
 * @param obj - Object to check
 * @returns true if object is null, undefined, or has no own enumerable properties
 *
 * @example
 * ```typescript
 * isEmpty({}) // Returns: true
 * isEmpty({ name: 'test' }) // Returns: false
 * isEmpty(null) // Returns: true
 * isEmpty(undefined) // Returns: true
 * ```
 */
export function isEmpty(obj: unknown): boolean {
  if (obj == null) {
    return true
  }
  // For objects, check if they have any enumerable properties
  // Using for...in is faster than Object.keys().length for checking emptiness
  for (const _key in obj as object) {
    return false
  }
  return true
}
